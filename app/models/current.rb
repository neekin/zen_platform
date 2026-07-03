# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :user, :request_id, :ip, :user_agent
end
