import Component from "@glimmer/component";
import { action } from "@ember/object";
import { debounce, schedule } from "@ember/runloop";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import $ from "jquery";
import "datatables";  // Import the registered module

export default class DataTableComponent extends Component {
  @service capabilities;
  @service site;
  @tracked resourcesLoaded = false;
  @tracked dataTable = null;

  constructor() {
    super(...arguments);
    schedule('afterRender', this, () => {
      this.initializeDataTables();
    });
  }

  @action
  initializeDataTables() {
    const element = document.querySelector(".discourse-datatable");
    if (!element) return;

    const tables = element.querySelectorAll("table");
    if (tables.length > 0) {
      tables.forEach((table) => {
        const options = this.getDataTableOptions(table);
        
        try {
          const dataTable = $(table).DataTable(options);
          this.dataTable = dataTable;

          if (this.filtersEnabled(table)) {
            this.addFilters(dataTable);
          }
        } catch (error) {
          console.error("Failed to initialize DataTable:", error);
        }
      });
    }
  }

  willDestroy() {
    super.willDestroy();
    if (this.dataTable) {
      this.dataTable.destroy();
      this.dataTable = null;
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

  @action
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
