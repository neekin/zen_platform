# frozen_string_literal: true

module RichTextHelper
  # 将 Lexical JSON 渲染为 HTML
  #
  # 用法: <%= rich_text_html(article.body) %>
  def rich_text_html(content)
    return "" if content.blank? || content == "{}"

    begin
      state = JSON.parse(content)
      return "" unless state.dig("root", "children")

      render_nodes(state["root"]["children"])
    rescue JSON::ParserError
      content
    end
  end

  # 生成带样式的富文本 CSS
  # 在 layout 中调用: <%= rich_text_styles %>
  def rich_text_styles
    content_tag(:style, RICH_TEXT_CSS.html_safe) # rubocop:disable Rails/OutputSafety
  end

  private

  def render_nodes(nodes)
    nodes.map { |node| render_node(node) }.join.html_safe # rubocop:disable Rails/OutputSafety
  end

  def render_node(node)
    type = node["type"]
    children = node["children"]
    text = node["text"]
    format = node["format"]
    tag = node["tag"]
    url = node["url"]
    alt = node["alt"]
    list_type = node["listType"]
    style = build_style(node)

    case type
    when "root"
      render_nodes(children)
    when "text"
      apply_format(text || "", format)
    when "paragraph"
      content_tag(:p, children ? render_nodes(children) : "", style: style)
    when "heading"
      heading_tag = tag || "h2"
      content_tag(heading_tag.to_sym, children ? render_nodes(children) : "", style: style)
    when "quote"
      content_tag(:blockquote, children ? render_nodes(children) : "", class: "rich-text-quote")
    when "list"
      list_tag = list_type == "number" ? :ol : :ul
      content_tag(list_tag, children ? render_nodes(children) : "")
    when "listitem"
      content_tag(:li, children ? render_nodes(children) : "")
    when "link"
      link_to(children ? render_nodes(children) : url, url, target: "_blank", rel: "noopener noreferrer")
    when "image"
      image_tag(url, alt: alt || "", class: "rich-text-image")
    when "code"
      code_content = children&.map { |c| c["text"] || "" }&.join || ""
      language = node["language"]
      content_tag(:pre, content_tag(:code, code_content, class: language ? "language-#{language}" : nil))
    when "linebreak"
      tag(:br)
    when "extended-text"
      # 扩展文本节点（颜色、背景色、字号）
      inner = apply_format(text || "", format)
      apply_text_style(inner, node)
    else
      children ? render_nodes(children) : ""
    end
  end

  def build_style(node)
    styles = []
    styles << "text-align: #{node['format']}" if %w[left center right justify].include?(node["format"].to_s)
    styles.join("; ").presence
  end

  def apply_format(text, format)
    return text if format.blank?

    f = format.is_a?(String) ? format.to_i : format
    result = ERB::Util.html_escape(text)

    result = content_tag(:code, result) if f & 16 != 0
    result = content_tag(:strong, result) if f & 1 != 0
    result = content_tag(:em, result) if f & 2 != 0
    result = content_tag(:u, result) if f & 8 != 0
    result = content_tag(:del, result) if f & 4 != 0

    result
  end

  def apply_text_style(html, node)
    styles = []
    styles << "color: #{node['color']}" if node["color"].present?
    styles << "background-color: #{node['backgroundColor']}" if node["backgroundColor"].present?
    styles << "font-size: #{node['fontSize']}" if node["fontSize"].present?

    if styles.any?
      content_tag(:span, html, style: styles.join("; "))
    else
      html
    end
  end

  # Lexical format 标志
  FORMAT_BOLD = 1
  FORMAT_ITALIC = 2
  FORMAT_STRIKETHROUGH = 4
  FORMAT_UNDERLINE = 8
  FORMAT_CODE = 16

  RICH_TEXT_CSS = <<~CSS
    .rich-text-content {
      line-height: 1.8;
      font-size: 14px;
      color: var(--text-color, rgba(0, 0, 0, 0.88));
    }
    .rich-text-content p {
      margin: 0.5em 0;
    }
    .rich-text-content h1 { font-size: 28px; font-weight: 700; margin: 24px 0 12px; }
    .rich-text-content h2 { font-size: 22px; font-weight: 600; margin: 20px 0 10px; }
    .rich-text-content h3 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; }
    .rich-text-content blockquote.rich-text-quote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 12px 0;
      color: #666;
    }
    .rich-text-content ul, .rich-text-content ol {
      padding-left: 24px;
      margin: 8px 0;
    }
    .rich-text-content li { margin: 4px 0; }
    .rich-text-content a {
      color: var(--primary-color, #1677ff);
      text-decoration: underline;
    }
    .rich-text-content img.rich-text-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 8px 0;
    }
    .rich-text-content pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    .rich-text-content code {
      background: rgba(0, 0, 0, 0.06);
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
    }
    .rich-text-content pre code {
      background: none;
      padding: 0;
    }
    .rich-text-content u { text-decoration: underline; }
    .rich-text-content del { text-decoration: line-through; }
  CSS
end
