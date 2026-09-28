<?php
/**
 * Thème « William Rosset — Portfolio 3D »
 *
 * Le portfolio est un export statique Next.js rangé dans /site.
 * Ce fichier intercepte les requêtes publiques et renvoie le bon fichier :
 *   /                  → site/index.html
 *   /projets/pulse/    → site/projets/pulse/index.html
 *   /projets/pulse/index.txt?_rsc=… (navigation client) → le fichier .txt
 *   tout le reste      → site/404.html (statut 404)
 *
 * L'administration (/wp-admin, /wp-login.php) et l'API REST ne passent pas
 * par ici et fonctionnent normalement. Les JS, CSS, polices et images sont
 * servis directement par le serveur depuis le dossier du thème.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Types MIME des fichiers de l'export */
function wrp_mime_type($file)
{
    $types = array(
        'html'  => 'text/html; charset=UTF-8',
        'txt'   => 'text/plain; charset=UTF-8',
        'js'    => 'application/javascript; charset=UTF-8',
        'css'   => 'text/css; charset=UTF-8',
        'json'  => 'application/json; charset=UTF-8',
        'svg'   => 'image/svg+xml',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'png'   => 'image/png',
        'webp'  => 'image/webp',
        'avif'  => 'image/avif',
        'gif'   => 'image/gif',
        'ico'   => 'image/x-icon',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'mp4'   => 'video/mp4',
        'webm'  => 'video/webm',
    );
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    return isset($types[$ext]) ? $types[$ext] : 'application/octet-stream';
}

/** Envoie un fichier de l'export et arrête WordPress */
function wrp_send_file($file, $status = 200)
{
    status_header($status);
    header('Content-Type: ' . wrp_mime_type($file));
    header('X-Content-Type-Options: nosniff');

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if ($ext === 'html' || $ext === 'txt') {
        // Pages : toujours la dernière version après une mise à jour du thème
        header('Cache-Control: no-cache, must-revalidate');
    } else {
        header('Cache-Control: public, max-age=2592000');
    }

    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

/** Trouve le fichier de l'export correspondant à l'URL demandée */
function wrp_resolve_file($request_path)
{
    $root = realpath(get_template_directory() . '/site');
    if ($root === false) {
        return null;
    }

    $path = trim(rawurldecode($request_path), '/');
    if (strpos($path, "\0") !== false) {
        return null;
    }

    $candidates = $path === ''
        ? array('index.html')
        : array($path, $path . '/index.html', $path . '.html');

    foreach ($candidates as $candidate) {
        $file = realpath($root . '/' . $candidate);
        // realpath + préfixe : empêche toute sortie du dossier /site (../)
        if ($file !== false && is_file($file) && strpos($file, $root . DIRECTORY_SEPARATOR) === 0) {
            return $file;
        }
    }
    return null;
}

/** Point d'entrée : priorité 0, avant les redirections canoniques de WordPress */
function wrp_serve_portfolio()
{
    if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST) || is_feed() || is_robots()) {
        return;
    }

    $uri  = isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '/';
    $path = (string) parse_url($uri, PHP_URL_PATH);

    // WordPress installé dans un sous-dossier : on retire ce préfixe
    $home_path = (string) parse_url(home_url('/'), PHP_URL_PATH);
    if ($home_path !== '' && $home_path !== '/' && strpos($path, $home_path) === 0) {
        $path = substr($path, strlen($home_path));
    }

    $file = wrp_resolve_file($path);
    if ($file !== null) {
        wrp_send_file($file, 200);
    }

    $not_found = get_template_directory() . '/site/404.html';
    if (is_file($not_found)) {
        wrp_send_file($not_found, 404);
    }
}
add_action('template_redirect', 'wrp_serve_portfolio', 0);
