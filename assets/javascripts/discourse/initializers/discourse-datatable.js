import { withPluginApi } from "discourse/lib/plugin-api";
import { getOwner } from "@ember/application";

export default {
  name: "discourse-datatable",

  initialize(container) {
    withPluginApi("0.8.31", api => {
      const siteSettings = container.lookup("service:site-settings");
      
      if (!siteSettings.datatable_enabled) {
        return;
      }

      api.modifyClass("controller:application", {
        pluginId: "discourse-datatable",
        
        actions: {
          initDataTable() {
            // Any global initialization if needed
          }
        }
      });
    });
  }
}; 