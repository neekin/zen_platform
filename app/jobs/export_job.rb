# frozen_string_literal: true

class ExportJob < ApplicationJob
  queue_as :default

  ALLOWED_RESOURCES = %w[Article Task Product].freeze
  ALLOWED_FILTER_COLUMNS = %w[status category_id created_at].freeze

  def perform(export_id)
    export = Export.find(export_id)
    export.update!(status: "processing")

    records = fetch_records(export)
    file_path = generate_file(export, records)

    export.update!(
      status: "completed",
      file_path: file_path,
      row_count: records.count,
    )

    NotificationService.notify(
      recipient: export.user,
      action: "export_ready",
      notifiable: export,
      metadata: { format: export.format, resource: export.resource },
    )
  rescue StandardError => e
    export.update!(status: "failed", error_message: e.message)
    raise
  end

  private

  def fetch_records(export)
    raise "Unauthorized resource: #{export.resource}" unless ALLOWED_RESOURCES.include?(export.resource)

    model = export.resource.constantize
    filters = export.filters.present? ? JSON.parse(export.filters) : {}

    scope = model.all
    filters.each do |key, value|
      next unless ALLOWED_FILTER_COLUMNS.include?(key.to_s)
      scope = scope.where(key => value) if value.present?
    end
    scope
  end

  def generate_file(export, records)
    case export.format
    when "csv"
      Exporters::CsvExporter.new(records, export.resource).generate
    when "xlsx"
      Exporters::ExcelExporter.new(records, export.resource).generate
    when "pdf"
      Exporters::PdfExporter.new(records, export.resource).generate
    end
  end
end
