# frozen_string_literal: true

class ExportService
  def self.export(resource:, format:, user:, filters: {})
    export = Export.create!(
      user: user,
      format: format,
      resource: resource,
      filters: filters.to_json,
      status: "pending",
    )

    ExportJob.perform_later(export.id)
    export
  end
end
