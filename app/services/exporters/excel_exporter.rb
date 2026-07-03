# frozen_string_literal: true

module Exporters
  class ExcelExporter
    def initialize(records, resource_name)
      @records = records
      @resource_name = resource_name
    end

    def generate
      columns = @records.column_names - %w[id created_at updated_at]
      timestamp = Time.current.strftime("%Y%m%d%H%M%S")
      file_path = Rails.root.join("storage", "exports", "#{@resource_name.underscore}_#{timestamp}.xlsx")

      FileUtils.mkdir_p(File.dirname(file_path))

      package = Axlsx::Package.new
      workbook = package.workbook

      workbook.add_worksheet(name: @resource_name) do |sheet|
        sheet.add_row columns
        @records.find_each do |record|
          sheet.add_row columns.map { |col| record.send(col) }
        end
      end

      package.serialize(file_path.to_s)
      file_path.to_s
    end
  end
end
