<?php
/**
 * Modèle de secours exigé par WordPress. En pratique, functions.php
 * répond avant (hook template_redirect) et ce fichier n'est jamais atteint.
 */
if (!defined('ABSPATH')) {
    exit;
}

wrp_serve_portfolio();
