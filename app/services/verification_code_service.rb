# frozen_string_literal: true

# 验证码服务
# 验证码存储在 Rails.cache 中，默认 5 分钟过期
class VerificationCodeService
  CODE_LENGTH = 6
  EXPIRY = 5.minutes

  class << self
    # 生成并存储验证码
    def generate(user, purpose)
      code = CODE_LENGTH.times.map { rand(10) }.join
      cache_key = cache_key(user.id, purpose)

      Rails.cache.write(cache_key, code, expires_in: EXPIRY)

      # TODO: 发送验证码邮件，目前先输出到控制台
      puts "========================================="
      puts "  验证码 [#{purpose}]: #{code}"
      puts "  用户: #{user.email}"
      puts "========================================="

      code
    end

    # 验证验证码
    def verify?(user, purpose, code)
      cache_key = cache_key(user.id, purpose)
      stored_code = Rails.cache.read(cache_key)

      return false if stored_code.blank?
      return false unless stored_code == code

      # 验证成功后删除验证码
      Rails.cache.delete(cache_key)
      true
    end

    private

    def cache_key(user_id, purpose)
      "verification_code:#{user_id}:#{purpose}"
    end
  end
end
