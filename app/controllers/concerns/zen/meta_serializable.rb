# frozen_string_literal: true

module Zen
  module MetaSerializable
    extend ActiveSupport::Concern

    private

    # 将模型的 DSL 元数据传递给 Inertia 页面
    # 用法: render inertia: "admin/articles/Index", props: zen_props(Article, articles: @articles.as_json)
    def zen_props(model_class, **extra_props)
      extra_props.merge(meta: model_class.zen_meta)
    end
  end
end
