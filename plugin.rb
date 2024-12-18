# name: Datatable Plugin
# about: Adds DataTables support to Discourse
# version: 0.1
# authors: bluefroguk1
# url: https://github.com/bluefroguk1/discourse-datatable-plugin
# required_version: 2.7.0

enabled_site_setting :datatable_enabled

register_asset "javascripts/discourse/components/datatable-component.js", :client
register_asset "stylesheets/datatable.css", :client

register_svg_icon "table" if respond_to?(:register_svg_icon)
