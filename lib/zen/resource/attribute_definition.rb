# frozen_string_literal: true

module Zen
  class Resource
    class AttributeDefinition
      attr_reader :name, :type, :options

      def initialize(name, type, **options)
        @name = name.to_sym
        @type = type.to_sym
        @options = options
      end

      def required?
        options[:required] == true
      end

      def readonly?
        options[:readonly] == true
      end

      def default
        options[:default]
      end

      def searchable?
        options[:searchable] == true
      end

      def sortable?
        options[:sortable] != false
      end

      def enum_values
        options[:values] || []
      end

      def to_h
        {
          name: name,
          type: type,
          required: required?,
          readonly: readonly?,
          default: default,
          searchable: searchable?,
          enum_values: enum_values
        }.compact
      end
    end
  end
end
