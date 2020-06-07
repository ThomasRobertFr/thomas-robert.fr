module Jekyll
  module GetLang
    def get_lang(input, lang, default_lang = 'en')
        return input unless input.is_a?(Hash)
        if not input[lang].nil?
            return input[lang]
        end
        if not input[default_lang].nil?
            return input[default_lang]
        end
        raise "No translation found"
    end
  end
end

Liquid::Template.register_filter(Jekyll::GetLang)