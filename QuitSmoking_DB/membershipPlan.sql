-- Gói Trãi Nghiệm Miễn Phí
INSERT INTO membership_plans (id, plan_name, plan_type, price, duration_days, description, is_active, created_at, updated_at)
VALUES (
    'FREE_TRIAL_PLAN',
    'Gói Trãi Nghiệm Miễn Phí',
    'THIRTY_DAYS_TRIAL',
    0.00,
    30,
    'Gói dùng thử 30 ngày với các tính năng cơ bản.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) AS new_data -- Using 'new_data' as the alias
ON DUPLICATE KEY UPDATE
    plan_name = new_data.plan_name,
    plan_type = new_data.plan_type,
    price = new_data.price,
    duration_days = new_data.duration_days,
    description = new_data.description,
    is_active = new_data.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Gói 30 Ngày
INSERT INTO membership_plans (id, plan_name, plan_type, price, duration_days, description, is_active, created_at, updated_at)
VALUES (
    'PLAN_30_DAYS',
    'Gói 30 Ngày',
    'THIRTY_DAYS',
    99000.00,
    30,
    'Gói thành viên 30 ngày.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) AS new_data
ON DUPLICATE KEY UPDATE
    plan_name = new_data.plan_name,
    plan_type = new_data.plan_type,
    price = new_data.price,
    duration_days = new_data.duration_days,
    description = new_data.description,
    is_active = new_data.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Gói 60 Ngày
INSERT INTO membership_plans (id, plan_name, plan_type, price, duration_days, description, is_active, created_at, updated_at)
VALUES (
    'PLAN_60_DAYS',
    'Gói 60 Ngày',
    'SIXTY_DAYS',
    249000.00,
    60,
    'Gói thành viên 60 ngày.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) AS new_data
ON DUPLICATE KEY UPDATE
    plan_name = new_data.plan_name,
    plan_type = new_data.plan_type,
    price = new_data.price,
    duration_days = new_data.duration_days,
    description = new_data.description,
    is_active = new_data.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Gói 90 Ngày
INSERT INTO membership_plans (id, plan_name, plan_type, price, duration_days, description, is_active, created_at, updated_at)
VALUES (
    'PLAN_90_DAYS',
    'Gói 90 Ngày',
    'NINETY_DAYS',
    599000.00,
    90,
    'Gói thành viên 90 ngày.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) AS new_data
ON DUPLICATE KEY UPDATE
    plan_name = new_data.plan_name,
    plan_type = new_data.plan_type,
    price = new_data.price,
    duration_days = new_data.duration_days,
    description = new_data.description,
    is_active = new_data.is_active,
    updated_at = CURRENT_TIMESTAMP;