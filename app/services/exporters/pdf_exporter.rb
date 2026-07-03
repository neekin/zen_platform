# frozen_string_literal: true

module Exporters
  class PdfExporter
    def initialize(records, resource_name)
      @records = records
      @resource_name = resource_name
    end

    def generate
      columns = @records.column_names - %w[id created_at updated_at]
      timestamp = Time.current.strftime("%Y%m%d%H%M%S")
      file_path = Rails.root.join("storage", "exports", "#{@resource_name.underscore}_#{timestamp}.pdf")

      FileUtils.mkdir_p(File.dirname(file_path))

      Prawn::Document.generate(file_path.to_s) do |pdf|
        pdf.text "#{@resource_name} Export", size: 18, style: :bold
        pdf.move_down 20

        data = [columns.map(&:humanize)]
        @records.find_each do |record|
          data << columns.map { |col| record.send(col).to_s }
        end

        pdf.table(data, header: true, width: pdf.bounds.width) do
          row(0).style(background_color: "1677FF", text_color: "FFFFFF", font_style: :bold)
          cells.borders = [:top, :bottom]
          cells.padding = [5, 8]
        end
      end

      file_path.to_s
    end
  end
end
