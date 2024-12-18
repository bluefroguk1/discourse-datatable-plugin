import Component from "@ember/component";
import { action } from "@ember/object";
import { debounce } from "@ember/runloop";

export default class DataTableComponent extends Component {
  // Load DataTables resources only when necessary
  async didInsertElement() {
    super.didInsertElement();

    await this.loadResources();
    this.initializeDataTables();
  }

  willDestroyElement() {
    super.willDestroyElement();

    // Clean up DataTables instances
    const tables = this.element.querySelectorAll("table");
    tables.forEach((table) => {
      if ($.fn.DataTable.isDataTable(table)) {
        $(table).DataTable().destroy();
      }
    });
  }

  /**
   * Dynamically load DataTables CSS and JS from the CDN.
   * @returns {Promise} Resolves when resources are loaded.
   */
  async loadResources() {
    const loadResource = (type, url) => {
      return new Promise((resolve, reject) => {
        let elem;
        switch (type) {
          case "css":
            elem = document.createElement("link");
            elem.rel = "stylesheet";
            elem.href = url;
            break;
          case "script":
            elem = document.createElement("script");
            elem.type = "text/javascript";
            elem.src = url;
            break;
          default:
            return reject(new Error("Invalid resource type"));
        }
        elem.onload = () => resolve();
        elem.onerror = () => reject(new Error(`Failed to load resource: ${url}`));
        document.head.appendChild(elem);
      });
    };

    const cssURL = "//cdn.datatables.net/2.1.8/css/dataTables.dataTables.min.css";
    const jsURL = "//cdn.datatables.net/2.1.8/js/dataTables.min.js";

    await Promise.all([loadResource("css", cssURL), loadResource("script", jsURL)]);
  }

  /**
   * Initialize DataTables for all tables in the component.
   */
  initializeDataTables() {
    const tables = this.element.querySelectorAll("table");
    if (tables.length > 0) {
      tables.forEach((table) => {
        const options = this.getDataTableOptions(table);

        // Initialize DataTable
        const dataTable = $(table).DataTable(options);

        // Add custom filters if enabled
        if (this.filtersEnabled(table)) {
          this.addFilters(dataTable);
        }
      });
    }
  }

  /**
   * Extract DataTable options from data attributes.
   * @param {HTMLElement} table - Table element.
   * @returns {Object} DataTables configuration options.
   */
  getDataTableOptions(table) {
    const defaults = { paging: false };

    // Extract options from data attributes (e.g., data-dt-paging)
    const datasetOptions = Object.keys(table.dataset)
      .filter((key) => key.startsWith("dt"))
      .reduce((acc, key) => {
        const optionKey = key.replace("dt", "").toLowerCase();
        acc[optionKey] = JSON.parse(table.dataset[key]);
        return acc;
      }, {});

    return { ...defaults, ...datasetOptions };
  }

  /**
   * Check if filters are enabled for the table.
   * @param {HTMLElement} table - Table element.
   * @returns {boolean} True if filters are enabled, otherwise false.
   */
  filtersEnabled(table) {
    return table.dataset.filters === "true";
  }

  /**
   * Add custom filter inputs for each column in the DataTable.
   * @param {Object} dataTable - DataTables API instance.
   */
  addFilters(dataTable) {
    const api = dataTable.api();
    api.columns().eq(0).each((index) => {
      const header = api.column(index).header();
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("data-filter", "true");

      // Debounce input events to reduce filter calls
      input.addEventListener(
        "input",
        debounce(() => {
          api.column(index).search(input.value).draw();
        }, 300)
      );

      // Prevent sorting when clicking the filter input
      input.addEventListener("click", (event) => event.stopPropagation());

      header.appendChild(input);
    });
  }
}
