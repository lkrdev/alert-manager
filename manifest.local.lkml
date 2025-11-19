application: alert_manager {
  label: "Alert Manager"
  url: "https://localhost:8080/bundle.js"
  entitlements: {
    core_api_methods: [
      "me", 
      "search_alerts", 
      "update_alert", 
      "get_alert", 
      "create_alert", 
      "delete_alert", 
      "unfollow_alert", 
      "all_integrations", 
      "query", 
      "lookml_model_explore",
      "query"
    ]
    navigation: yes
    new_window: yes
    use_form_submit: yes
    use_embeds: yes
    use_iframes: yes
    raw_api_request: yes
  }
}