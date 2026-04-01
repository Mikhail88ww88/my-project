<?php
$bot_token  = '8784521405:AAGvKmzxc7puF3ys-Xno1RDhO7k71GuN2DA';
$chat_id    = '703870634';
$chat_id_2  = '6564145719';

$phone    = isset($_POST['phone'])        ? trim($_POST['phone'])        : '';
$ym_id    = isset($_POST['ym_client_id']) ? trim($_POST['ym_client_id']) : '-';
$page_url = isset($_POST['page_url'])     ? trim($_POST['page_url'])     : '-';
$referer  = isset($_POST['referer'])      ? trim($_POST['referer'])      : '';
$ip       = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '-';

// Все параметры из URL в том порядке как стоят
$params_string = '';
if ($page_url !== '-') {
    $query = parse_url($page_url, PHP_URL_QUERY);
    if ($query) {
        parse_str($query, $params);
        foreach ($params as $key => $value) {
            $params_string .= $key . ': ' . $value . "\n";
        }
    }
}

// Источник трафика
if ($params_string) {
    $source = 'Платный трафик';
} elseif (strpos($referer, 'yandex') !== false) {
    $source = 'Яндекс (органика)';
} elseif (strpos($referer, 'google') !== false) {
    $source = 'Google (органика)';
} elseif (strpos($referer, 'vk.com') !== false) {
    $source = 'ВКонтакте';
} elseif ($referer === '' || $referer === '-') {
    $source = 'Прямой заход';
} else {
    $source = $referer;
}

if (!empty($phone)) {

    // Парсим UTM из page_url
    $url_params = [];
    if ($page_url !== '-') {
        $query = parse_url($page_url, PHP_URL_QUERY);
        if ($query) parse_str($query, $url_params);
    }

    // === AmoCRM API v4 ===
    $amo_subdomain = 'imww88.amocrm.ru';
    $amo_login     = 'imww88@gmail.com';
    $amo_key       = 'e53bf7b822c7921ff27ae743f5b3f8dc016fa1b4';
    $amo_cookie    = '/tmp/amo_mumkam.txt';

    $auth_ch = curl_init("https://{$amo_subdomain}/private/api/auth.php?type=json");
    curl_setopt($auth_ch, CURLOPT_POST, true);
    curl_setopt($auth_ch, CURLOPT_POSTFIELDS, "USER_LOGIN={$amo_login}&USER_HASH={$amo_key}");
    curl_setopt($auth_ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($auth_ch, CURLOPT_COOKIEJAR, $amo_cookie);
    curl_setopt($auth_ch, CURLOPT_TIMEOUT, 10);
    curl_exec($auth_ch);
    curl_close($auth_ch);

    $utm_fields = [];
    $utm_map = [
        // Стандартные UTM
        1038519 => $url_params['utm_source']   ?? '',
        1038515 => $url_params['utm_medium']   ?? '',
        1038517 => $url_params['utm_campaign'] ?? $url_params['campaign'] ?? '',
        1038521 => $url_params['utm_keyword']  ?? $url_params['utm_term'] ?? '',
        1038513 => $url_params['utm_content']  ?? '',
        1038523 => $referer,
        1038527 => $referer,
        1042363 => ($ym_id !== '-' ? $ym_id : ''),
        1042013 => 'MUMKAM.RU',
        // Яндекс.Директ параметры
        1041273 => $url_params['region_name']   ?? '',
        1042003 => $url_params['region_id']     ?? '',
        1042027 => $url_params['campaign_id']   ?? '',
        1042005 => $url_params['type']          ?? $url_params['source_type'] ?? '',
        1042015 => $url_params['block']         ?? $url_params['position_type'] ?? '',
        1042009 => $url_params['pos']           ?? '',
        1041379 => $url_params['device']        ?? $url_params['device_type'] ?? '',
        1042029 => $url_params['ad']            ?? $url_params['ad_id'] ?? '',
        1042031 => $url_params['gbid']          ?? '',
        1042033 => $url_params['phrase']        ?? $url_params['phrase_id'] ?? '',
        1042035 => $url_params['ret']           ?? $url_params['retargeting_id'] ?? '',
        1042037 => $url_params['coef']          ?? $url_params['coef_goal_context_id'] ?? '',
        1042039 => $url_params['match_type']    ?? '',
        1042041 => $url_params['matched']       ?? $url_params['matched_keyword'] ?? '',
        1042043 => $url_params['adtarget_name'] ?? '',
        1042045 => $url_params['adtarget_id']   ?? '',
        1042047 => $url_params['source']        ?? '',
        1042049 => $url_params['source_type']   ?? '',
        1038547 => $url_params['yclid']         ?? '',
    ];
    foreach ($utm_map as $fid => $val) {
        if ($val !== '') {
            $utm_fields[] = ['field_id' => $fid, 'values' => [['value' => $val]]];
        }
    }

    $lead_payload = [[
        'name'                => 'Новая сделка MUMKAM.RU',
        'pipeline_id'         => 10129158,
        'status_id'           => 80256438,
        'responsible_user_id' => 13033970,
        'custom_fields_values'=> $utm_fields,
        '_embedded'           => [
            'contacts' => [[
                'name'                 => $phone,
                'custom_fields_values' => [[
                    'field_code' => 'PHONE',
                    'values'     => [['value' => $phone, 'enum_code' => 'WORK']]
                ]]
            ]]
        ]
    ]];

    $lead_ch = curl_init("https://{$amo_subdomain}/api/v4/leads/complex");
    curl_setopt($lead_ch, CURLOPT_POST, true);
    curl_setopt($lead_ch, CURLOPT_POSTFIELDS, json_encode($lead_payload));
    curl_setopt($lead_ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($lead_ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($lead_ch, CURLOPT_COOKIEFILE, $amo_cookie);
    curl_setopt($lead_ch, CURLOPT_TIMEOUT, 15);
    curl_exec($lead_ch);
    curl_close($lead_ch);

    // === TELEGRAM ===
    $clean_url = strtok($page_url, '?');
    $tg = "Новая заявка MUMKAM.RU\n";
    $tg .= "Телефон: " . $phone . "\n";
    $tg .= "Источник: " . $source . "\n";
    $tg .= "Страница: " . $clean_url . "\n";
    $tg .= "Яндекс ClientID: " . $ym_id . "\n";
    $tg .= "IP: " . $ip . "\n";
    if ($params_string) {
        $tg .= "\nПараметры:\n" . $params_string;
    }

    $ch = curl_init("https://api.telegram.org/bot{$bot_token}/sendMessage");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, ['chat_id' => $chat_id, 'text' => $tg]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_exec($ch);
    curl_close($ch);

    $ch2 = curl_init("https://api.telegram.org/bot{$bot_token}/sendMessage");
    curl_setopt($ch2, CURLOPT_POST, true);
    curl_setopt($ch2, CURLOPT_POSTFIELDS, ['chat_id' => $chat_id_2, 'text' => $tg]);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 10);
    curl_exec($ch2);
    curl_close($ch2);

    // === EMAIL ===
    $body  = "Новая заявка с сайта MUMKAM.RU\r\n";
    $body .= "================================\r\n";
    $body .= "Телефон: " . $phone . "\r\n";
    $body .= "Источник: " . $source . "\r\n";
    $body .= "Яндекс ClientID: " . $ym_id . "\r\n";
    $body .= "\r\nПараметры визита:\r\n";
    $body .= "IP: " . $ip . "\r\n";
    $clean_url = strtok($page_url, '?');
    $body .= "Страница: " . $clean_url . "\r\n";
    if ($params_string) {
        $body .= "\r\nПараметры из URL:\r\n" . str_replace("\n", "\r\n", $params_string);
    }

    $subject = '=?UTF-8?B?' . base64_encode('Новая заявка MUMKAM.RU — ' . $phone) . '?=';
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: base64\r\n";
    $headers .= "From: MUMKAM.RU <imww88@gmail.com>\r\n";

    mail('imww88@gmail.com', $subject, base64_encode($body), $headers);
    mail('im33ww@gmail.com', $subject, base64_encode($body), $headers);
}

exit;
