# frozen_string_literal: true

module Zen
  class Resource
    class AssociationDefinition
      attr_reader :name, :type, :options

      def initialize(name, type, **options)
        @name = name.to_sym
        @type = type.to_sym
        @options = options
      end

      def display_field
        options[:display] || :name
      end

      def count_only?
        options[:count_only] == true
      end

      def lazy?
        options[:lazy] == true
      end

      def belongs_to?
        type == :belongs_to
      end

      def has_many?
        type == :has_many
      end

      def to_h
        {
          name: name,
          type: type,
          display_field: display_field,
          count_only: count_only?,
          lazy: lazy?
        }.compact
      end
    end
  end
end
