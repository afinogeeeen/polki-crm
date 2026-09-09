import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Tag, 
  Rate, 
  Button, 
  Input, 
  Typography, 
  Modal, 
  message, 
  Badge, 
  Empty, 
  Tooltip,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import { 
  MessageOutlined, 
  StarOutlined, 
  CheckCircleOutlined, 
  ShopOutlined, 
  SendOutlined, 
  ThunderboltOutlined, 
  LinkOutlined,
  CommentOutlined,
  ApiOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import type { MarketplaceReview, MarketplaceQuestion, MarketplaceChat, MarketplaceType } from '../types';
import { dataStore } from '../api/dataStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const MARKETPLACE_LINKS: Record<MarketplaceType, { name: string; brand: string; url: string; color: string }> = {
  ozon: { 
    name: 'Ozon', 
    brand: 'Каменный Ручей', 
    url: 'https://www.ozon.ru/seller/kamennyy-ruchey/', 
    color: '#005bff' 
  },
  wildberries: { 
    name: 'Wildberries', 
    brand: 'Каменный Ручей', 
    url: 'https://www.wildberries.ru/brands/311237602-kamenniy-ruchey', 
    color: '#cb11ab' 
  },
  yandex: { 
    name: 'Яндекс.Маркет', 
    brand: 'Каменный Ручей', 
    url: 'https://market.yandex.ru/business--kamennyi-ruchei/90395292?generalContext=t%3DshopInShop%3Bi%3D1%3Bbi%3D90395292%3B&rs=eJwzkvnEKMnBKLDwEKsEg8aiQ6wa94-warx_9YBZY9URVgCOxQrU&searchContext=sins_ctx', 
    color: '#fc3f1d' 
  },
};

const TEMPLATE_ANSWERS = [
  'Здравствуйте! Благодарим за выбор бренда «Каменный Ручей». Да, мы изготавливаем полки из натурального камня по любым индивидуальным размерам!',
  'Добрый день! Спасибо за теплый отзыв и высокую оценку нашей работы! Каждая каменная полка тщательно шлифуется мастером вручную.',
  'Здравствуйте! В комплект входит усиленный скрытый крепеж для бетонных и кирпичных стен, выдерживающий нагрузку до 25-30 кг.',
  'Здравствуйте! Поверхность камня обработана защитной гидрофобной пропиткой «Каменный Ручей», благодаря чему камень не впитывает влагу и средства гигиены.',
  'Здравствуйте! Для заказа нестандартных размеров или вырезов под сантехнику перейдите на наш сайт polkistone.ru или напишите нам напрямую.',
];

const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'reviews' | 'questions'>('chats');
  const [selectedMp, setSelectedMp] = useState<string>('all');
  const [reviews, setReviews] = useState<MarketplaceReview[]>(dataStore.getReviews());
  const [questions, setQuestions] = useState<MarketplaceQuestion[]>(dataStore.getQuestions());
  const [chats, setChats] = useState<MarketplaceChat[]>(dataStore.getChats());
  const [selectedChat, setSelectedChat] = useState<MarketplaceChat | null>(
    dataStore.getChats().length > 0 ? dataStore.getChats()[0] : null
  );
  const [chatInputText, setChatInputText] = useState('');

  // Reply modal for reviews/questions
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyItem, setReplyItem] = useState<{ id: string; type: 'review' | 'question'; author: string; text: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadData = () => {
    setReviews(dataStore.getReviews());
    setQuestions(dataStore.getQuestions());
    const chList = dataStore.getChats();
    setChats(chList);
    if (selectedChat) {
      const fresh = chList.find(c => c.id === selectedChat.id);
      if (fresh) setSelectedChat(fresh);
    }
  };

  const handleOpenReply = (id: string, type: 'review' | 'question', author: string, text: string) => {
    setReplyItem({ id, type, author, text });
    setReplyText('');
    setReplyModalOpen(true);
  };

  const handleSendReply = () => {
    if (!replyItem || !replyText.trim()) {
      message.warning('Пожалуйста, введите текст ответа');
      return;
    }

    if (replyItem.type === 'review') {
      dataStore.replyReview(replyItem.id, replyText.trim());
      message.success('Ответ на отзыв отправлен на маркетплейс!');
    } else {
      dataStore.answerQuestion(replyItem.id, replyText.trim());
      message.success('Ответ на вопрос отправлен покупателю!');
    }

    setReplyModalOpen(false);
    loadData();
  };

  const handleSendChatMessage = () => {
    if (!selectedChat || !chatInputText.trim()) return;
    dataStore.sendChatMessage(selectedChat.id, chatInputText.trim());
    setChatInputText('');
    message.success('Сообщение отправлено в чат покупателю!');
    loadData();
  };

  // Filtering
  const filteredReviews = reviews.filter(r => 
    selectedMp === 'all' || r.marketplace === selectedMp
  );

  const filteredQuestions = questions.filter(q => 
    selectedMp === 'all' || q.marketplace === selectedMp
  );

  const filteredChats = chats.filter(c => 
    selectedMp === 'all' || c.marketplace === selectedMp
  );

  const pendingReviewsCount = reviews.filter(r => !r.is_answered).length;
  const pendingQuestionsCount = questions.filter(q => !q.is_answered).length;
  const unreadChatsCount = chats.reduce((sum, c) => sum + c.unread_count, 0);

  const [mobileChatView, setMobileChatView] = useState<'list' | 'chat'>('list');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }} className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <ShopOutlined className="mr-2 text-purple-500" />
            Единое окно коммуникаций маркетплейсов — «Каменный Ручей»
          </Title>
          <Text className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Прямые чаты с покупателями (Ozon, Wildberries, Яндекс), отзывы и вопросы из одного окна
          </Text>
        </div>

        {/* Quick direct links to MP stores */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(MARKETPLACE_LINKS).map(([key, item]) => {
            const bgClass = key === 'ozon'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : key === 'wildberries'
              ? 'bg-fuchsia-700 hover:bg-fuchsia-800 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white';

            return (
              <a
                key={key}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${bgClass}`}
              >
                <LinkOutlined /> {item.name}
              </a>
            );
          })}
        </div>
      </div>

      {/* Direct API Info Alert */}
      <Alert
        message="Прямой вывод сообщений маркетплейсов в CRM"
        description={
          <div className="text-xs space-y-1">
            <span>
              <strong>Техническая возможность:</strong> API всех 3-х маркетплейсов поддерживает работу с диалогами:
            </span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li><strong>Ozon Seller API:</strong> методы <code>/v1/chat/list</code>, <code>/v1/chat/history</code>, <code>/v1/chat/send/message</code> (требуется Premium Plus).</li>
              <li><strong>Wildberries API:</strong> раздел «Общение с покупателями» — методы чатов по заказам и товарам.</li>
              <li><strong>Яндекс.Маркет Partner API:</strong> раздел Chats API и Webhook уведомления о сообщениях в реальном времени.</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        icon={<ApiOutlined />}
        className="border-slate-700 bg-slate-800/80 text-slate-300"
      />

      {/* Filter by marketplace */}
      <Card className="apple-card rounded-2xl" styles={{ body: { padding: '14px 18px' } }}>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Витрины маркетплейсов:</span>
          <button 
            type="button"
            onClick={() => setSelectedMp('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
              selectedMp === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700'
            }`}
          >
            Все обращения ({reviews.length + questions.length + chats.length})
          </button>
          <button 
            type="button"
            onClick={() => setSelectedMp('ozon')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
              selectedMp === 'ozon'
                ? 'bg-[#005bff] text-white shadow-sm ring-2 ring-blue-400/50'
                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25'
            }`}
          >
            <span>Ozon</span>
          </button>
          <button 
            type="button"
            onClick={() => setSelectedMp('wildberries')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
              selectedMp === 'wildberries'
                ? 'bg-[#cb11ab] text-white shadow-sm ring-2 ring-fuchsia-400/50'
                : 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-500/25'
            }`}
          >
            <span>Wildberries</span>
          </button>
          <button 
            type="button"
            onClick={() => setSelectedMp('yandex')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
              selectedMp === 'yandex'
                ? 'bg-[#fc3f1d] text-white shadow-sm ring-2 ring-red-400/50'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            <span>Яндекс.Маркет</span>
          </button>
        </div>
      </Card>

      {/* Main Tabs: Chats vs Reviews vs Questions */}
      <Card className="apple-card rounded-2xl" styles={{ body: { padding: '16px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as 'chats' | 'reviews' | 'questions')}
          items={[
            {
              key: 'chats',
              label: (
                <span className="text-sm sm:text-base px-1 sm:px-2">
                  <CommentOutlined /> Чаты{' '}
                  <Badge count={unreadChatsCount} overflowCount={99} className="ml-1 sm:ml-2" />
                </span>
              ),
              children: (
                <div className="mt-2">
                  <Row gutter={[16, 16]}>
                    {/* Left: Chat List (on mobile, hidden when chat is opened) */}
                    <Col 
                      xs={24} 
                      md={9} 
                      lg={8} 
                      className={mobileChatView === 'chat' ? 'hidden md:block' : 'block'}
                    >
                      <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                        {filteredChats.map(c => {
                          const mp = MARKETPLACE_LINKS[c.marketplace];
                          const isSelected = selectedChat?.id === c.id;
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedChat(c);
                                c.unread_count = 0;
                                setMobileChatView('chat');
                              }}
                              className={`p-3 rounded-xl cursor-pointer border transition ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50/80 dark:bg-slate-700/70 shadow-sm' 
                                  : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                  <Tag color={mp.color} className="text-[10px] py-0 px-1 font-semibold">
                                    {mp.name}
                                  </Tag>
                                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                                    {c.buyer_name}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{c.last_message_date.split(' ')[1]}</span>
                              </div>

                              <div className="text-[11px] text-blue-600 dark:text-blue-300 truncate mb-1 font-medium">
                                {c.product_title}
                              </div>

                              <div className="text-xs text-slate-600 dark:text-slate-400 truncate flex justify-between items-center">
                                <span className="truncate max-w-[190px]">{c.last_message}</span>
                                {c.unread_count > 0 && (
                                  <Badge count={c.unread_count} className="ml-1" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Col>

                    {/* Right: Active Chat Conversation (on mobile, hidden when list is active) */}
                    <Col 
                      xs={24} 
                      md={15} 
                      lg={16}
                      className={mobileChatView === 'list' ? 'hidden md:block' : 'block'}
                    >
                      {selectedChat ? (
                        <Card 
                          className="apple-card border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col min-h-[480px] md:h-[580px]"
                          styles={{ body: { padding: '12px' } }}
                          title={
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                {/* Mobile back button */}
                                <Button 
                                  icon={<ArrowLeftOutlined />} 
                                  size="small"
                                  onClick={() => setMobileChatView('list')}
                                  className="md:hidden text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                >
                                  Чаты
                                </Button>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-slate-100 mr-2 text-sm sm:text-base">
                                    {selectedChat.buyer_name}
                                  </span>
                                  <Tag color={MARKETPLACE_LINKS[selectedChat.marketplace].color} className="text-[10px]">
                                    {MARKETPLACE_LINKS[selectedChat.marketplace].name}
                                  </Tag>
                                </div>
                              </div>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-normal truncate max-w-[200px] sm:max-w-xs">
                                {selectedChat.product_title}
                              </span>
                            </div>
                          }
                        >
                          {/* Messages area */}
                          <div className="space-y-3 overflow-y-auto max-h-[320px] md:max-h-[360px] pr-2 mb-4">
                            {selectedChat.messages.map(m => {
                              const isSeller = m.sender === 'seller';
                              return (
                                <div 
                                  key={m.id} 
                                  className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                                >
                                  <div 
                                    className={`p-2.5 sm:p-3 rounded-xl max-w-[85%] text-xs ${
                                      isSeller 
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                                    }`}
                                  >
                                    <div className="text-[10px] opacity-75 mb-1 font-semibold">
                                      {isSeller ? 'Мастерская «Каменный Ручей»' : selectedChat.buyer_name}
                                    </div>
                                    <div className="leading-relaxed">{m.text}</div>
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{m.date}</span>
                                </div>
                              );
                            })}
                          </div>

                          <Divider className="!my-2 !border-slate-200 dark:!border-slate-700" />

                          {/* Quick reply templates */}
                          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
                            {TEMPLATE_ANSWERS.slice(0, 3).map((tpl, i) => (
                              <Button 
                                key={i} 
                                size="small" 
                                className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 whitespace-nowrap"
                                onClick={() => setChatInputText(tpl)}
                              >
                                {tpl.slice(0, 30)}...
                              </Button>
                            ))}
                          </div>

                          {/* Input and Send */}
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Напишите ответ покупателю маркетплейса..." 
                              value={chatInputText}
                              onChange={e => setChatInputText(e.target.value)}
                              onPressEnter={handleSendChatMessage}
                            />
                            <Button 
                              type="primary" 
                              icon={<SendOutlined />}
                              onClick={handleSendChatMessage}
                              className="bg-blue-600 hover:bg-blue-500 shrink-0"
                            >
                              Отправить
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="h-[400px] md:h-[580px] flex items-center justify-center text-slate-500">
                          Выберите диалог из списка
                        </div>
                      )}
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'reviews',
              label: (
                <span className="text-base px-2">
                  <StarOutlined /> Отзывы покупателей{' '}
                  <Badge count={pendingReviewsCount} overflowCount={99} className="ml-2" />
                </span>
              ),
              children: (
                <div className="space-y-4 mt-2">
                  {filteredReviews.length === 0 ? (
                    <Empty description="Отзывов пока нет" className="py-8" />
                  ) : (
                    filteredReviews.map(r => {
                      const mp = MARKETPLACE_LINKS[r.marketplace];
                      return (
                        <Card 
                          key={r.id} 
                          className="apple-card border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-400/50 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <a href={mp.url} target="_blank" rel="noreferrer">
                                <Tag 
                                  color={mp.color} 
                                  className="font-semibold text-xs px-2.5 py-0.5 cursor-pointer hover:opacity-80"
                                >
                                  {mp.name}
                                </Tag>
                              </a>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{r.author}</span>
                              <Rate disabled defaultValue={r.rating} className="text-sm" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{r.review_date}</span>
                              {r.is_answered ? (
                                <Tag color="success" icon={<CheckCircleOutlined />}>Отвечено</Tag>
                              ) : (
                                <Tag color="warning">Требует ответа</Tag>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center justify-between">
                            <span>Товар: {r.product_name}</span>
                            <Tooltip title="Открыть витрину на маркетплейсе">
                              <a href={mp.url} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-blue-500">
                                <LinkOutlined /> Перейти в магазин
                              </a>
                            </Tooltip>
                          </div>

                          <Paragraph className="!text-slate-800 dark:!text-slate-200 text-sm mb-2">
                            {r.text}
                          </Paragraph>

                          {r.pros && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                              <strong className="text-green-600 dark:text-green-400">Достоинства:</strong> {r.pros}
                            </div>
                          )}
                          {r.cons && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                              <strong className="text-red-600 dark:text-red-400">Недостатки:</strong> {r.cons}
                            </div>
                          )}

                          {r.is_answered && r.reply_text && (
                            <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg border-l-4 border-blue-500 text-xs border border-slate-200 dark:border-slate-700">
                              <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">Ответ мастера «Каменный Ручей»:</div>
                              <div className="text-slate-700 dark:text-slate-300">{r.reply_text}</div>
                            </div>
                          )}

                          {!r.is_answered && (
                            <div className="mt-4 flex justify-end">
                              <Button 
                                type="primary" 
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => handleOpenReply(r.id, 'review', r.author, r.text)}
                                className="bg-blue-600 hover:bg-blue-500"
                              >
                                Ответить на отзыв
                              </Button>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              ),
            },
            {
              key: 'questions',
              label: (
                <span className="text-base px-2">
                  <MessageOutlined /> Вопросы о товарах{' '}
                  <Badge count={pendingQuestionsCount} overflowCount={99} className="ml-2" />
                </span>
              ),
              children: (
                <div className="space-y-4 mt-2">
                  {filteredQuestions.length === 0 ? (
                    <Empty description="Вопросов пока нет" className="py-8" />
                  ) : (
                    filteredQuestions.map(q => {
                      const mp = MARKETPLACE_LINKS[q.marketplace];
                      return (
                        <Card 
                          key={q.id} 
                          className="apple-card border-slate-200 dark:border-slate-700 rounded-2xl hover:border-purple-400/50 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <a href={mp.url} target="_blank" rel="noreferrer">
                                <Tag 
                                  color={mp.color} 
                                  className="font-semibold text-xs px-2.5 py-0.5 cursor-pointer hover:opacity-80"
                                >
                                  {mp.name}
                                </Tag>
                              </a>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{q.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{q.question_date}</span>
                              {q.is_answered ? (
                                <Tag color="success" icon={<CheckCircleOutlined />}>Отвечено</Tag>
                              ) : (
                                <Tag color="warning">Ждет ответа</Tag>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center justify-between">
                            <span>Товар: {q.product_name}</span>
                            <a href={mp.url} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-purple-500">
                              <LinkOutlined /> Открыть витрину
                            </a>
                          </div>

                          <Paragraph className="!text-slate-800 dark:!text-slate-200 text-sm mb-2 font-medium">
                            «{q.question_text}»
                          </Paragraph>

                          {q.is_answered && q.answer_text && (
                            <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg border-l-4 border-purple-500 text-xs border border-slate-200 dark:border-slate-700">
                              <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">Ответ продавца («Каменный Ручей»):</div>
                              <div className="text-slate-700 dark:text-slate-300">{q.answer_text}</div>
                            </div>
                          )}

                          {!q.is_answered && (
                            <div className="mt-4 flex justify-end">
                              <Button 
                                type="primary" 
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => handleOpenReply(q.id, 'question', q.author, q.question_text)}
                                className="bg-purple-600 hover:bg-purple-500"
                              >
                                Ответить покупателю
                              </Button>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal for Review/Question Reply */}
      <Modal
        title={`Ответ покупателю ${replyItem?.author || ''}`}
        open={replyModalOpen}
        onOk={handleSendReply}
        onCancel={() => setReplyModalOpen(false)}
        okText="Отправить ответ"
        cancelText="Отмена"
        width={680}
      >
        <div className="mt-3 space-y-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Вопрос / отзыв покупателя:</span>
            {replyItem?.text}
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
              <ThunderboltOutlined className="text-yellow-500" /> Фирменные шаблоны ответов («Каменный Ручей»):
            </div>
            <div className="flex flex-col gap-1.5 mb-3">
              {TEMPLATE_ANSWERS.map((tpl, i) => (
                <Button 
                  key={i} 
                  size="small" 
                  className="text-left text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700 hover:border-blue-500 h-auto py-1.5 px-2 whitespace-normal"
                  onClick={() => setReplyText(tpl)}
                >
                  {tpl}
                </Button>
              ))}
            </div>

            <TextArea
              rows={4}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Напишите официальный ответ от лица бренда «Каменный Ручей»..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Messages;
