class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  def self.track_changes
    has_paper_trail(
      ignore: [ :updated_at, :created_at ],
      meta: {
        request_id: ->(_record) { Current.request_id },
        ip: ->(_record) { Current.ip },
        metadata: ->(_record) {
          { user_agent: Current.user_agent, user_id: Current.user&.id }.compact.to_json
        }
      }
    )
  end
end
