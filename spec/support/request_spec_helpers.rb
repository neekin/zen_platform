# frozen_string_literal: true

module RequestSpecHelpers
  def sign_in(user)
    # 直接设置 session，避免触发 Vite 渲染
    # SessionsController#create 设置 session[:user_id]
    post "/admin/login", params: {
      account: user.email,
      password: "password123"
    }, headers: { "Accept" => "text/html" }
  end

  def sign_out
    delete "/admin/logout"
  end

  # 直接设置 session（绕过 Vite 渲染）
  def login_as(user)
    # 使用 integration spec 方式直接设置 session
    allow_any_instance_of(ActionDispatch::Request)
      .to receive(:session)
      .and_wrap_original do |method, *args|
        session = method.call(*args)
        session[:user_id] = user.id
        session
      end
  end
end

RSpec.configure do |config|
  config.include RequestSpecHelpers, type: :request
end
