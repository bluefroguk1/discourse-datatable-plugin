# name: discourse-datatable
# about: Adds DataTables support to Discourse
# version: 0.1
# authors: bluefroguk1
# url: https://github.com/bluefroguk1/discourse-datatable-plugin
# required_version: 2.7.0

enabled_site_setting :datatable_enabled

# Register plugin assets
register_asset "stylesheets/datatable.css"

# Register external libraries
register_javascript_module("datatables", "https://cdn.datatables.net/2.1.8/js/jquery.dataTables.min.js")
register_css "https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.min.css"

# Register component
register_html_builder("server:before-head-close") do
  "<script type='module'>import DataTableComponent from 'discourse/plugins/discourse-datatable/components/datatable-component';</script>"
end

register_svg_icon "table" if respond_to?(:register_svg_icon)

after_initialize do
  # Add any server-side initialization if needed
end
