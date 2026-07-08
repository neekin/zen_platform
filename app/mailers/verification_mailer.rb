# frozen_string_literal: true

class VerificationMailer < ApplicationMailer
  # 发送验证码
  def verification_code(user, code, purpose)
    @user = user
    @code = code
    @purpose = purpose_text(purpose)
    @expiry = 5

    mail(
      to: user.email,
      subject: "【Zen Platform】验证码"
    )
  end

  private

  def purpose_text(purpose)
    case purpose
    when "bind_phone"
      "绑定手机号码"
    when "change_password"
      "修改密码"
    else
      "验证身份"
    end
  end
end
