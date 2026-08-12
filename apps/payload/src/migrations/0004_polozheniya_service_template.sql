-- Migration: добавить ServiceTemplate «Разработка Положений для ПК»
-- 12 базовых Положений, синхронизированных с Уставом
-- Срок: 12-16 дней, Цена: 25 000 ₽

INSERT INTO service_templates (
  name, slug, service_type, description, short_description,
  price_min, price_max, currency, payment_schedule,
  total_x_p, estimated_duration_days, is_active, is_public, sort_order,
  created_at, updated_at
) VALUES (
  'Разработка Положений для ПК',
  'polozheniya-pk',
  'polozheniya',
  'Разработка полного комплекта 12 базовых Положений потребительского кооператива, синхронизированных с Уставом и моделью С500.',
  '12 базовых Положений ПК, синхронизированных с Уставом. Полный комплект за 12-16 дней.',
  25000, 25000, 'RUB', '100_prepaid',
  100, 14, true, true, 150, NOW(), NOW()
) RETURNING id;

-- Этапы (4)
INSERT INTO service_templates_stages (_order, _parent_id, num, name, icon, description, who) VALUES
(1, (SELECT id FROM service_templates WHERE slug = 'polozheniya-pk'), 0, 'Регистрация', '📝', 'Стартовый бонус +2 XP', 'client'),
(2, (SELECT id FROM service_templates WHERE slug = 'polozheniya-pk'), 1, 'Бриф', '📋', 'Заполнение анкеты', 'client'),
(3, (SELECT id FROM service_templates WHERE slug = 'polozheniya-pk'), 2, 'Разработка Положений', '⚖️', 'Разработка 12 базовых Положений', 'executor'),
(4, (SELECT id FROM service_templates WHERE slug = 'polozheniya-pk'), 3, 'Передача', '📦', 'Передача готовых Положений', 'executor');

-- Documents: 2 (Регистрация) + 1 (Бриф) + 12 (Положения) + 1 (Передача) = 16
-- (см. add_polozheniya_service.py для полного списка)
