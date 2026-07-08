# frozen_string_literal: true

module Admin
  class PluginsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/plugins
    def index
      plugins = Zen::PluginManager.installed_plugins
      render inertia: "admin/plugins/Index",
        props: { plugins: plugins }
    end

    # POST /admin/plugins/:name/install
    def install
      result = Zen::PluginInstaller.install(params[:name])
      redirect_to admin_plugins_path, notice: result[:message]
    rescue Zen::PluginInstaller::InstallError => e
      redirect_to admin_plugins_path, alert: e.message
    end

    # DELETE /admin/plugins/:name/uninstall
    def uninstall
      result = Zen::PluginInstaller.uninstall(params[:name])
      redirect_to admin_plugins_path, notice: result[:message]
    rescue Zen::PluginInstaller::InstallError => e
      redirect_to admin_plugins_path, alert: e.message
    end

    # POST /admin/plugins/:name/enable
    def enable
      Zen::PluginManager.enable_plugin(params[:name])
      redirect_to admin_plugins_path, notice: "插件已启用"
    end

    # POST /admin/plugins/:name/disable
    def disable
      Zen::PluginManager.disable_plugin(params[:name])
      redirect_to admin_plugins_path, notice: "插件已禁用"
    end
  end
end
