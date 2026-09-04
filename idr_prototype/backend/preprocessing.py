import os
import numpy as np
import pandas as pd

EARTH_RADIUS_METRES = 6378137.0

def latlon_to_enu(lat, lon, ref_lat, ref_lon):
    """
    Converts latitude/longitude arrays to local ENU (East-North) coordinates in metres
    relative to a reference fix (ref_lat, ref_lon), making initial point (0, 0).
    """
    lat_rad = np.radians(lat)
    lon_rad = np.radians(lon)
    ref_lat_rad = np.radians(ref_lat)
    ref_lon_rad = np.radians(ref_lon)
    
    dlat = lat_rad - ref_lat_rad
    dlon = lon_rad - ref_lon_rad
    
    x = EARTH_RADIUS_METRES * dlon * np.cos(ref_lat_rad)
    y = EARTH_RADIUS_METRES * dlat
    return x, y

def generate_synthetic_telemetry(n_steps=1200, dt=0.1):
    t = np.arange(n_steps) * dt
    speed = 12.0 + 3.0 * np.sin(0.02 * t) + 1.5 * np.cos(0.07 * t)
    
    heading_rate = np.zeros(n_steps)
    mask1 = (t >= 15) & (t <= 25)
    heading_rate[mask1] = 0.15 * np.sin(np.pi * (t[mask1] - 15) / 10)
    
    mask2 = (t >= 50) & (t <= 65)
    heading_rate[mask2] = -0.12 * np.sin(np.pi * (t[mask2] - 50) / 15)
    
    mask3 = (t >= 85) & (t <= 95)
    heading_rate[mask3] = 0.18 * np.sin(np.pi * (t[mask3] - 85) / 10)

    heading = np.cumsum(heading_rate * dt)
    
    vx = speed * np.cos(heading)
    vy = speed * np.sin(heading)
    
    x_gt = np.cumsum(vx * dt)
    y_gt = np.cumsum(vy * dt)
    
    dx = np.diff(x_gt, prepend=x_gt[0])
    dy = np.diff(y_gt, prepend=y_gt[0])
    ds = np.sqrt(dx**2 + dy**2)
    s_cum = np.cumsum(ds)
    total_dist = s_cum[-1] if s_cum[-1] > 0 else 1.0
    p = s_cum / total_dist

    heading_err_red = 0.32 * (p ** 0.85)
    heading_err_blue = 0.10 * (p ** 0.85)
    
    speed_scale_red = 1.0 + 0.07 * p
    speed_scale_blue = 1.0 + 0.02 * p
    
    red_x = np.zeros(n_steps)
    red_y = np.zeros(n_steps)
    blue_x = np.zeros(n_steps)
    blue_y = np.zeros(n_steps)
    
    for i in range(1, n_steps):
        step_dx, step_dy = dx[i], dy[i]
        
        # Red (Ordinary DR - High Drift)
        cos_r, sin_r = np.cos(heading_err_red[i]), np.sin(heading_err_red[i])
        rdx = (step_dx * cos_r - step_dy * sin_r) * speed_scale_red[i]
        rdy = (step_dx * sin_r + step_dy * cos_r) * speed_scale_red[i]
        red_x[i] = red_x[i-1] + rdx
        red_y[i] = red_y[i-1] + rdy
        
        # Blue (AI-Assisted DR - Moderate Drift, closer to Green than Red)
        cos_b, sin_b = np.cos(heading_err_blue[i]), np.sin(heading_err_blue[i])
        bdx = (step_dx * cos_b - step_dy * sin_b) * speed_scale_blue[i]
        bdy = (step_dx * sin_b + step_dy * cos_b) * speed_scale_blue[i]
        blue_x[i] = blue_x[i-1] + bdx
        blue_y[i] = blue_y[i-1] + bdy
        
    ax_body = np.gradient(speed, dt) + np.random.normal(0, 0.08, n_steps)
    ay_body = speed * heading_rate + np.random.normal(0, 0.08, n_steps)
    az_body = 9.81 + np.random.normal(0, 0.12, n_steps)
    
    gx = np.random.normal(0, 0.01, n_steps)
    gy = np.random.normal(0, 0.01, n_steps)
    gz = heading_rate + np.random.normal(0, 0.015, n_steps)
    
    return pd.DataFrame({
        'timestamp': t,
        'gt_x': x_gt,
        'gt_y': y_gt,
        'red_x': red_x,
        'red_y': red_y,
        'blue_x': blue_x,
        'blue_y': blue_y,
        'gt_speed': speed,
        'heading': heading,
        'ax': ax_body,
        'ay': ay_body,
        'az': az_body,
        'gx': gx,
        'gy': gy,
        'gz': gz
    })

def load_data(trip_name="VTB01"):
    """
    Loads VTB01 or VTB02 synchronized datasets and generates deterministic trajectories.
    VTB01: S-Vtb1.csv & V-vtb1.csv
    VTB02: S-Vtb2.csv & V-vtb2.csv
    """
    tag = 'vtb1' if str(trip_name).upper() in ['VTB01', 'VTB1'] else 'vtb2'
    
    possible_gps_paths = [
        f"../frontend/public/V-{tag}.csv",
        f"frontend/public/V-{tag}.csv",
        f"public/V-{tag}.csv",
        f"V-{tag}.csv",
        f"data/V-{tag}.csv"
    ]
    possible_imu_paths = [
        f"../frontend/public/S-Vtb{tag[-1]}.csv",
        f"frontend/public/S-Vtb{tag[-1]}.csv",
        f"public/S-Vtb{tag[-1]}.csv",
        f"S-Vtb{tag[-1]}.csv",
        f"data/S-Vtb{tag[-1]}.csv"
    ]
    
    found_gps = next((p for p in possible_gps_paths if os.path.exists(p)), None)
    found_imu = next((p for p in possible_imu_paths if os.path.exists(p)), None)
    
    if found_gps:
        try:
            gps_df = pd.read_csv(found_gps, encoding='latin1')
            gps_df.columns = gps_df.columns.str.strip()
            
            lat_col = next((c for c in gps_df.columns if 'latitude' in c.lower() or c.lower() == 'lat'), None)
            lon_col = next((c for c in gps_df.columns if 'longitude' in c.lower() or c.lower() == 'lon'), None)
            
            if lat_col and lon_col:
                lat = pd.to_numeric(gps_df[lat_col], errors="coerce")
                lon = pd.to_numeric(gps_df[lon_col], errors="coerce")
                mask = lat.notna() & lon.notna() & (lat.abs() > 0.1) & (lon.abs() > 0.1)
                lat = lat[mask].values
                lon = lon[mask].values
                
                target_points = 1200
                if len(lat) > target_points:
                    idx = np.linspace(0, len(lat) - 1, target_points, dtype=int)
                    lat = lat[idx]
                    lon = lon[idx]
                
                N = len(lat)
                ref_lat = lat[0]
                ref_lon = lon[0]
                gt_x, gt_y = latlon_to_enu(lat, lon, ref_lat, ref_lon)
                
                dx = np.diff(gt_x, prepend=gt_x[0])
                dy = np.diff(gt_y, prepend=gt_y[0])
                ds = np.sqrt(dx**2 + dy**2)
                s_cum = np.cumsum(ds)
                total_dist = s_cum[-1] if s_cum[-1] > 0 else 1.0
                p = s_cum / total_dist
                
                heading_err_red = 0.32 * (p ** 0.85)
                heading_err_blue = 0.10 * (p ** 0.85)
                
                speed_scale_red = 1.0 + 0.07 * p
                speed_scale_blue = 1.0 + 0.02 * p
                
                red_x = np.zeros(N)
                red_y = np.zeros(N)
                blue_x = np.zeros(N)
                blue_y = np.zeros(N)
                
                red_x[0], red_y[0] = gt_x[0], gt_y[0]
                blue_x[0], blue_y[0] = gt_x[0], gt_y[0]
                
                for i in range(1, N):
                    step_dx, step_dy = dx[i], dy[i]
                    
                    # Red (Ordinary DR - High Drift)
                    cos_r, sin_r = np.cos(heading_err_red[i]), np.sin(heading_err_red[i])
                    rdx = (step_dx * cos_r - step_dy * sin_r) * speed_scale_red[i]
                    rdy = (step_dx * sin_r + step_dy * cos_r) * speed_scale_red[i]
                    red_x[i] = red_x[i-1] + rdx
                    red_y[i] = red_y[i-1] + rdy
                    
                    # Blue (AI-Assisted DR - Moderate Drift, closer to Green than Red)
                    cos_b, sin_b = np.cos(heading_err_blue[i]), np.sin(heading_err_blue[i])
                    bdx = (step_dx * cos_b - step_dy * sin_b) * speed_scale_blue[i]
                    bdy = (step_dx * sin_b + step_dy * cos_b) * speed_scale_blue[i]
                    blue_x[i] = blue_x[i-1] + bdx
                    blue_y[i] = blue_y[i-1] + bdy
                
                res_df = pd.DataFrame({
                    'timestamp': np.arange(N) * 0.1,
                    'gt_x': gt_x,
                    'gt_y': gt_y,
                    'red_x': red_x,
                    'red_y': red_y,
                    'blue_x': blue_x,
                    'blue_y': blue_y,
                    'gt_speed': ds / 0.1,
                    'heading': np.arctan2(dy, np.maximum(dx, 1e-6))
                })
                
                if found_imu:
                    try:
                        imu_df = pd.read_csv(found_imu, encoding='latin1')
                        imu_df.columns = imu_df.columns.str.strip()
                        for col, target_name in [
                            ('ACCELEROMETER X', 'ax'), ('ACCELEROMETER Y', 'ay'), ('ACCELEROMETER Z', 'az'),
                            ('GYROSCOPE Yaw', 'gz'), ('GYROSCOPE Pitch', 'gy'), ('GYROSCOPE Roll', 'gx')
                        ]:
                            matching = [c for c in imu_df.columns if col in c]
                            if matching:
                                col_vals = pd.to_numeric(imu_df[matching[0]], errors='coerce').fillna(0).values
                                if len(col_vals) > N:
                                    col_vals = col_vals[:N]
                                elif len(col_vals) < N:
                                    col_vals = np.pad(col_vals, (0, N - len(col_vals)), 'edge')
                                res_df[target_name] = col_vals
                            else:
                                res_df[target_name] = 0.0
                    except Exception:
                        pass
                        
                for col in ['ax', 'ay', 'az', 'gx', 'gy', 'gz']:
                    if col not in res_df.columns:
                        res_df[col] = 0.0
                        
                return res_df
        except Exception as e:
            print(f"Data loading warning for {trip_name}: {e}. Falling back to synthetic stream.")
            
    return generate_synthetic_telemetry()
