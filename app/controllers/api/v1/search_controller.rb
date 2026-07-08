# frozen_string_literal: true

module Api
  module V1
    class SearchController < ApiController
      skip_before_action :require_authentication

      # GET /api/v1/search/users?q=xxx
      def users
        query = params[:q].to_s.strip
        users = User.all

        if query.present?
          users = users.where("name LIKE :q OR email LIKE :q", q: "%#{query}%")
        end

        render json: users.limit(20).map { |u|
          { id: u.id, name: u.name, avatar: u.respond_to?(:avatar_url) ? u.avatar_url : nil }
        }
      end

      # GET /api/v1/search/roles?q=xxx
      def roles
        query = params[:q].to_s.strip
        roles = Role.all

        if query.present?
          roles = roles.where("name LIKE :q", q: "%#{query}%")
        end

        render json: roles.limit(50).map { |r|
          { id: r.id, name: r.name }
        }
      end
    end
  end
end
