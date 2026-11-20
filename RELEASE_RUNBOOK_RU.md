# Выпуск витрины

Запустите `Prepare production candidate` из `main`. По умолчанию workflow берёт исходник из `release/storefront`. В поле `storefront_ref` можно указать ветку исправления или SHA. Передайте проверенный манифест backend, его SHA и контрольную сумму действующего `.htaccess`.

Для исправлений интерфейса оставьте поля снимка пустыми. Workflow сравнит код с опубликованным выпуском, возьмёт данные из его HTML и проверит новый кандидат на Apache. Изменения каталога, загрузчиков и маршрутов требуют полного пути с ID снимка API и SHA256 его индекса.

Для публикации используйте `Deploy production` с frontend SHA из манифеста кандидата, ID подготовки и SHA256 архива. Для возврата к предыдущей версии используйте `Roll back production` с SHA опубликованной версии.

[Порядок подготовки, проверки и отката](https://github.com/mldev92/frames-front-focus/blob/release/storefront/RELEASE_RUNBOOK_RU.md)
