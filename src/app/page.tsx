'use client';
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f7971e] to-[#ffd200] flex items-center justify-center text-[#1a1a2e] font-black text-lg">
              Ш
            </div>
            <span className="text-xl font-bold">Школа ПК</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#about" className="hover:text-[#ffd200] transition">О школе</a>
            <a href="#program" className="hover:text-[#ffd200] transition">Программа</a>
            <a href="#benefits" className="hover:text-[#ffd200] transition">Преимущества</a>
            <a href="#faq" className="hover:text-[#ffd200] transition">Вопросы</a>
            <a href="#contact" className="btn-primary text-sm !py-2 !px-5">Записаться</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] opacity-50"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(247, 151, 30, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 210, 0, 0.06) 0%, transparent 50%)'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#f7971e]/30 text-[#ffd200] text-sm mb-6">
            Первая Онлайн Школа Потребительских Кооперативов
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
            Создай свой<br />
            <span className="gradient-text">потребительский кооператив</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#b8b8d0] max-w-2xl mx-auto mb-10">
            Полное обучение, юридическое сопровождение и защита активов. 
            От идеи до действующего кооператива по Закону РФ № 3085-1.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="btn-primary text-lg">Начать обучение</a>
            <a href="#program" className="btn-outline text-lg">Смотреть программу</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '500+', label: 'Выпускников' },
            { num: '50+', label: 'Кооперативов создано' },
            { num: '7', label: 'Лет практики' },
            { num: '98%', label: 'Довольных учеников' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl sm:text-4xl font-black gradient-text">{s.num}</div>
              <div className="text-[#b8b8d0] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Что такое <span className="gradient-text">Школа ПК</span>?</h2>
            <p className="text-[#b8b8d0] max-w-2xl mx-auto">
              Образовательная платформа, которая даёт все знания и инструменты для создания и управления 
              потребительским кооперативом в соответствии с законодательством РФ.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Обучение',
                desc: 'Пошаговые видеокурсы, вебинары и практические задания. От основ кооперации до управления действующим кооперативом.',
              },
              {
                icon: '⚖️',
                title: 'Юридическое сопровождение',
                desc: 'Аудит устава, регистрация кооператива под ключ, правовая поддержка на всех этапах деятельности.',
              },
              {
                icon: '🛡️',
                title: 'Защита активов',
                desc: 'Налоговая оптимизация, защита пайщиков и имущества кооператива в рамках закона.',
              },
            ].map((card, i) => (
              <div key={i} className="glass rounded-2xl p-8 hover:border-[#f7971e]/30 transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-[#b8b8d0] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program */}
      <section id="program" className="py-20 bg-[#16213e]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Программа <span className="gradient-text">обучения</span></h2>
            <p className="text-[#b8b8d0] max-w-2xl mx-auto">
              Структурированный курс, который ведёт вас от идеи до полностью функционирующего кооператива.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { step: '01', title: 'Основы кооперации', desc: 'История, принципы и правовая база потребительских кооперативов в России. Закон РФ № 3085-1.' },
              { step: '02', title: 'Создание кооператива', desc: 'Разработка устава, формирование инициативной группы, проведение учредительного собрания.' },
              { step: '03', title: 'Регистрация и налоги', desc: 'Государственная регистрация, выбор системы налогообложения, открытие счетов.' },
              { step: '04', title: 'Управление и финансы', desc: 'Органы управления, бухгалтерский учёт, привлечение пайщиков и паевых взносов.' },
              { step: '05', title: 'Защита и рост', desc: 'Правовая защита кооператива и пайщиков, стратегии развития и масштабирования.' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 sm:p-8 flex gap-6 items-start hover:border-[#f7971e]/20 transition">
                <div className="text-4xl font-black gradient-text shrink-0">{item.step}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[#b8b8d0] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Почему <span className="gradient-text">Школа ПК</span>?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎯', title: 'Практика, не теория', desc: 'Реальные кейсы и шаблоны документов для регистрации кооператива.' },
              { icon: '👨‍⚖️', title: 'Юридическая поддержка', desc: 'Опытные юристы сопровождают вас на каждом этапе.' },
              { icon: '👥', title: 'Сообщество', desc: 'Закрытое сообщество пайщиков и руководителей кооперативов.' },
              { icon: '📱', title: 'Онлайн-формат', desc: 'Учитесь в удобное время с любого устройства.' },
            ].map((b, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center hover:border-[#f7971e]/30 transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold mb-2">{b.title}</h3>
                <p className="text-[#b8b8d0] text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#16213e]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Частые <span className="gradient-text">вопросы</span></h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Что такое потребительский кооператив?', a: 'Добровольное объединение граждан на основе членства для удовлетворения материальных и иных потребностей путём объединения имущественных паевых взносов. Регулируется Законом РФ № 3085-1.' },
              { q: 'Сколько человек нужно для создания ПК?', a: 'Минимум 3 физических лица или 3 юридических лица для учреждения потребительского кооператива.' },
              { q: 'Нужно ли регистрировать ПК?', a: 'Да, потребительский кооператив подлежит государственной регистрации как юридическое лицо в налоговом органе.' },
              { q: 'Какие налоги платит ПК?', a: 'ПК может применять ОСНО или УСН. Выбор зависит от вида деятельности и оборота. Мы помогаем выбрать оптимальную систему.' },
            ].map((faq, i) => (
              <details key={i} className="glass rounded-2xl group">
                <summary className="p-6 cursor-pointer font-semibold hover:text-[#ffd200] transition flex items-center justify-between list-none">
                  {faq.q}
                  <span className="text-[#f7971e] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6 text-[#b8b8d0] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Готовы создать свой <span className="gradient-text">кооператив</span>?</h2>
            <p className="text-[#b8b8d0] mb-8 max-w-lg mx-auto">
              Оставьте заявку и получите бесплатную консультацию по созданию потребительского кооператива.
            </p>
            <form className="max-w-md mx-auto space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Ваше имя"
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#666] focus:outline-none focus:border-[#f7971e]/50 transition"
              />
              <input
                type="tel"
                placeholder="Телефон"
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#666] focus:outline-none focus:border-[#f7971e]/50 transition"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#666] focus:outline-none focus:border-[#f7971e]/50 transition"
              />
              <button type="submit" className="btn-primary w-full text-lg !rounded-xl">
                Записаться на консультацию
              </button>
            </form>
            <p className="text-[#666] text-sm mt-4">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f7971e] to-[#ffd200] flex items-center justify-center text-[#1a1a2e] font-black text-sm">
                Ш
              </div>
              <span className="font-bold">Школа ПК</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#b8b8d0]">
              <a href="#about" className="hover:text-[#ffd200] transition">О школе</a>
              <a href="#program" className="hover:text-[#ffd200] transition">Программа</a>
              <a href="#faq" className="hover:text-[#ffd200] transition">FAQ</a>
              <a href="#contact" className="hover:text-[#ffd200] transition">Контакты</a>
            </div>
            <div className="text-sm text-[#666]">
              &copy; 2026 Школа ПК. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

