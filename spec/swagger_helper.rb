# frozen_string_literal: true

require "rails_helper"

RSpec.configure do |config|
  config.openapi_root = Rails.root.join("swagger").to_s
  config.openapi_specs = {
    "v1/swagger.json" => {
      openapi: "3.0.1",
      info: {
        title: "API V1",
        version: "v1",
        description: "Zen Platform API V1"
      },
      components: {
        securitySchemes: {
          bearer_auth: {
            type: :http,
            scheme: :bearer,
            bearer_format: :JWT
          },
          api_key: {
            type: :apiKey,
            name: "X-Api-Key",
            in: :header
          },
          signature: {
            type: :apiKey,
            name: "X-Signature",
            in: :header
          }
        }
      }
    }
  }
end
