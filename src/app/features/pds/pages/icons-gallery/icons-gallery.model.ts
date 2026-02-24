import { MATERIAL_ICONS_LIST } from '@ui-types/material-icons.model';

export interface IconViewModel {
  name: string;
  category: string;
}

export const ICONS_GALLERY_DEFAULTS = {
  pageSize: 25,
  emptyMessage: 'No se encontraron iconos con los filtros aplicados.',
} as const;

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: string }> = [
  { category: 'Navigation', pattern: /^(arrow|chevron|expand|unfold|north|south|east|west|navigate|first_page|last_page|fullscreen|menu|close|cancel|home|apps|more_|double_arrow|subdirectory|switch_|refresh)/ },
  { category: 'AV', pattern: /^(play|pause|stop|fast_|rewind|skip_|volume|mic|headphone|speaker|earbuds|music|audio|movie|video|replay|loop|shuffle|queue|library_music|album|equalizer|fiber_|hd|sd|4k|slow_motion|surround)/ },
  { category: 'Communication', pattern: /^(phone|call|chat|email|message|contact|inbox|send|sms|voicemail|ring|dialpad|rss|wifi_calling|import_contacts|co_present|present_|screen_share|duo|people|person|group|qr_code|comment|announcement|alternate_email|mail)/ },
  { category: 'Editor', pattern: /^(edit|format_|text_|insert_|add_chart|bar_chart|show_chart|pie_chart|bubble_chart|add_comment|mode_|align_|merge_type|undo|redo|border_|padding|title|notes|list|numbers|superscript|subscript|strikethrough|highlight|post_add|publish|query_stats|schema|table_|toc|sort_by_alpha|spellcheck|wrap_text)/ },
  { category: 'File', pattern: /^(folder|file_|cloud|upload|download|attach|attachment|drive_|source|snippet|topic|create_new_folder|grid_view|rule_folder|text_snippet|add_link)/ },
  { category: 'Device & Hardware', pattern: /^(bluetooth|battery|wifi|signal_|network_|nfc|gps|screen_|keyboard|print|tv|cast|computer|desktop|laptop|monitor|phone_android|phone_iphone|tablet|smartphone|watch|speaker|router|scanner|sim_card|usb|memory|storage|hardware|devices|gamepad|headset|mouse)/ },
  { category: 'Alert', pattern: /^(add_alert|warning|error|notification_important|auto_delete)/ },
  { category: 'Maps & Travel', pattern: /^(location|map|place|near_me|directions|local_|restaurant|hotel|airport|train|subway|flight|bus|taxi|car|bike|drive|route|pin_drop|navigation|my_location|explore|trip|traffic|transfer|ev_station|atm|beach|hiking|kayak|ski|surf|biking|snowboard|sled|nordic|paraglid|attractions|park|camping|luggage|anchor)/ },
  {  category: 'Social', pattern: /^(face|person|people|group|man|woman|child|baby|family|pregnant|elder|body|health|medical|sick|vaccine|coronavirus|emoji_|cake|party|school|science|psychology|sentiment|mood|thumb|waving|military|sports|outdoor|emoji)/ },
  { category: 'Commerce', pattern: /^(shopping|store|cart|payment|credit|currency|money|receipt|sell|price|discount|redeem|loyalty|wallet|savings|account_balance|paid|point_of_sale|local_offer|request_quote|attach_money|monetization|euro|currency_exchange)/ },
  { category: 'Photo & Image', pattern: /^(wb_|brightness|camera|photo|image|panorama|picture|landscape|portrait|flip|crop|filter|adjust|blur|color_|collections|compare|details|exposure|flash|grain|hdr|healing|iso|leak|lens|looks|loupe|monochrome|motion|nature|raw|rotate|slideshow|straighten|style|switch_camera|switch_video|texture|timer|tune|view_comfy|vignette|zoom_|remove_red_eye|add_a_photo|photo_album|photo_camera|photo_filter)/ },
  { category: 'Security', pattern: /^(lock|security|shield|verified|admin|key|password|fingerprint|privacy|https|http|vpn|gpp_|policy|dangerous|report|flag|block|do_not|not_interested)/ },
  { category: 'Settings & Tech', pattern: /^(settings|build|code|developer|integration|api|dns|terminal|cloud_|storage|memory|extension|puzzle|widgets|view_|layout|grid|table|hub|lan|account_tree|device_hub|apps_outage|manage|tune|rule|check_circle|done|toggle_|swap|autorenew|cached|sync|update|upgrade|install)/ },
];

function categorizeIcon(name: string): string {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(name)) return category;
  }
  return 'Other';
}

export function buildIconViewModels(): IconViewModel[] {
  return MATERIAL_ICONS_LIST.map(name => ({
    name,
    category: categorizeIcon(name),
  }));
}

export const ALL_ICON_CATEGORIES: string[] = [
  'Navigation',
  'AV',
  'Communication',
  'Editor',
  'File',
  'Device & Hardware',
  'Alert',
  'Maps & Travel',
  'Social',
  'Commerce',
  'Photo & Image',
  'Security',
  'Settings & Tech',
  'Other',
];

