import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Tag, Rate, Button, Input, Modal, message, Row, Col, Segmented, Avatar, Tabs, Popconfirm, Tooltip, Form, InputNumber, Select, Image } from 'antd';
import { 
  CheckCircleOutlined,
  LeftOutlined,
  SendOutlined,
  CameraOutlined, 
  ThunderboltOutlined, 
  LinkOutlined,
  CommentOutlined,
  StarOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  HolderOutlined,
  FolderOutlined,
  FolderAddOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { MarketplaceReview, MarketplaceQuestion, MarketplaceChat, MarketplaceType, TemplateItem } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { useTheme } from '../context/ThemeContext';
import ConnectionStatusBar from '../components/ConnectionStatusBar';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const MARKETPLACE_LINKS: Record<MarketplaceType, { name: string; brand: string; url: string; color: string; rating: number; reviewsCount: number }> = {
  ozon: { 
    name: 'Ozon', 
    brand: 'Каменный Ручей', 
    url: 'https://www.ozon.ru/seller/kamennyy-ruchey/', 
    color: '#005bff',
    rating: 4.9,
    reviewsCount: 142
  },
  wildberries: { 
    name: 'Wildberries', 
    brand: 'Каменный Ручей', 
    url: 'https://www.wildberries.ru/brands/311237602-kamenniy-ruchey', 
    color: '#cb11ab',
    rating: 4.8,
    reviewsCount: 289
  },
  yandex: { 
    name: 'Яндекс.Маркет', 
    brand: 'Каменный Ручей', 
    url: 'https://market.yandex.ru/business--kamennyi-ruchei/90395292', 
    color: '#fc3f1d',
    rating: 4.9,
    reviewsCount: 86
  },
};

export const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'reviews' | 'questions'>('chats');
  const [selectedMp, setSelectedMp] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [questions, setQuestions] = useState<MarketplaceQuestion[]>([]);
  const [chats, setChats] = useState<MarketplaceChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<MarketplaceChat | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [chatPhotos, setChatPhotos] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dynamic Templates & Folders
  const [chatTemplateItems, setChatTemplateItems] = useState<TemplateItem[]>([]);
  const [reviewTemplateItems, setReviewTemplateItems] = useState<TemplateItem[]>([]);
  const [questionTemplateItems, setQuestionTemplateItems] = useState<TemplateItem[]>([]);

  const [chatFolders, setChatFolders] = useState<string[]>([]);
  const [reviewFolders, setReviewFolders] = useState<string[]>([]);
  const [questionFolders, setQuestionFolders] = useState<string[]>([]);

  // Template Editor Modal & Folders
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalTab, setTemplateModalTab] = useState<'chat' | 'review' | 'question'>('chat');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [newTemplateFolder, setNewTemplateFolder] = useState('Общие');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Quick Reply Filters in chat and review modals
  const [chatQuickFolder, setChatQuickFolder] = useState<string>('all');
  const [replyQuickFolder, setReplyQuickFolder] = useState<string>('all');

  // Reply modal for reviews/questions
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyItem, setReplyItem] = useState<{ id: string; type: 'review' | 'question'; author: string; text: string; product: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  // Search params & URL chat selection
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryChatId = searchParams.get('chatId');

  // Order from Chat Modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm] = Form.useForm();

  const { isDark } = useTheme();

  const loadData = () => {
    const rev = dataStore.getReviews();
    const qst = dataStore.getQuestions();
    const ch = dataStore.getChats();
    setReviews(rev);
    setQuestions(qst);
    setChats(ch);
    setSelectedChat(prev => {
      if (!prev && ch.length > 0) return ch[0];
      if (prev) {
        const fresh = ch.find(c => c.id === prev.id);
        return fresh || (ch.length > 0 ? ch[0] : null);
      }
      return null;
    });

    // Load templates & folders
    setChatTemplateItems(dataStore.getTemplateItems('chat'));
    setReviewTemplateItems(dataStore.getTemplateItems('review'));
    setQuestionTemplateItems(dataStore.getTemplateItems('question'));

    setChatFolders(dataStore.getTemplateFolders('chat'));
    setReviewFolders(dataStore.getTemplateFolders('review'));
    setQuestionFolders(dataStore.getTemplateFolders('question'));
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeDataStore(() => loadData());
    return () => unsub();
  }, []);

  useEffect(() => {
    if (queryChatId && chats.length > 0) {
      setActiveTab('chats');
      const found = chats.find(c => c.id === queryChatId);
      if (found) {
        setSelectedChat(found);
      }
    }
  }, [queryChatId, chats]);

  const handleOpenOrderFromChat = () => {
    if (!selectedChat) return;

    let stone = 'Мрамор Calacatta Gold (Италия)';
    const title = (selectedChat.product_title || '').toLowerCase();
    if (title.includes('габбро') || title.includes('гранит')) stone = 'Гранит Габбро-Диабаз (Карелия)';
    else if (title.includes('оникс')) stone = 'Оникс Verde с LED-подсветкой (Иран)';
    else if (title.includes('crema') || title.includes('бежев')) stone = 'Мрамор Crema Marfil (Испания)';
    else if (title.includes('nero') || title.includes('черн')) stone = 'Мрамор Nero Marquina (Испания)';
    else if (title.includes('кварц')) stone = 'Кварцевый агломерат Pure White';

    orderForm.setFieldsValue({
      client_name: selectedChat.buyer_name,
      client_phone: selectedChat.buyer_phone || '+7 (999) 123-45-67',
      delivery_city: selectedChat.buyer_city || 'Москва',
      delivery_address: '',
      stone_type: stone,
      dimensions: '600х150х20 мм',
      total_price: 16500,
      prepayment_amount: 8250,
      notes: `Заказ оформлен из диалога ${MARKETPLACE_LINKS[selectedChat.marketplace].name} («${selectedChat.product_title || ''}»)`,
    });
    setOrderModalOpen(true);
  };

  const handleCreateOrderSubmit = (values: any) => {
    if (!selectedChat) return;

    const newOrder = dataStore.saveOrder({
      client_name: values.client_name,
      client_phone: values.client_phone,
      delivery_city: values.delivery_city,
      delivery_address: values.delivery_address,
      channel: 'marketplace',
      stone_type: values.stone_type,
      dimensions: values.dimensions,
      total_price: Number(values.total_price),
      prepayment_amount: Number(values.prepayment_amount),
      prepayment_received: true,
      remaining_paid: false,
      status: 'in_production',
      notes: values.notes,
      chat_id: selectedChat.id,
      chat_marketplace: selectedChat.marketplace,
      product_description: `Полка каменная: ${values.stone_type} (${values.dimensions})`,
    });

    dataStore.addChatMessage(selectedChat.id, `Заказ ${newOrder.order_number} на сумму ${newOrder.total_price.toLocaleString('ru-RU')} ₽ успешно принят в производство! Мастер приступил к распилу.`);

    message.success(`Заказ ${newOrder.order_number} успешно сформирован из диалога!`);
    setOrderModalOpen(false);
    loadData();
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (selectedMp !== 'all' && r.marketplace !== selectedMp) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return r.product_name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || r.author.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reviews, selectedMp, searchText]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(qItem => {
      if (selectedMp !== 'all' && qItem.marketplace !== selectedMp) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return qItem.product_name.toLowerCase().includes(q) || qItem.question_text.toLowerCase().includes(q) || qItem.author.toLowerCase().includes(q);
      }
      return true;
    });
  }, [questions, selectedMp, searchText]);

  const filteredChats = useMemo(() => {
    return chats.filter(c => {
      if (selectedMp !== 'all' && c.marketplace !== selectedMp) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return (c.product_title?.toLowerCase().includes(q)) || c.buyer_name.toLowerCase().includes(q) || c.last_message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [chats, selectedMp, searchText]);

  const unreadChatsCount = useMemo(() => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0), [chats]);
  const pendingReviewsCount = useMemo(() => reviews.filter(r => !r.is_answered).length, [reviews]);
  const pendingQuestionsCount = useMemo(() => questions.filter(q => !q.is_answered).length, [questions]);

  // Reply handlers
  const handleOpenReply = (id: string, type: 'review' | 'question', author: string, text: string, product: string) => {
    setReplyItem({ id, type, author, text, product });
    setReplyText('');
    setReplyModalOpen(true);
  };

  const handleSendReply = () => {
    if (!replyItem || !replyText.trim()) {
      message.warning('Введите текст ответа');
      return;
    }
    if (replyItem.type === 'review') {
      dataStore.replyReview(replyItem.id, replyText.trim());
      message.success('Ответ на отзыв опубликован!');
    } else {
      dataStore.answerQuestion(replyItem.id, replyText.trim());
      message.success('Ответ на вопрос отправлен покупателю!');
    }
    setReplyModalOpen(false);
    loadData();
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        message.warning('Пожалуйста, выберите изображение');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setChatPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    e.target.value = '';
  };

  const handleAttachPresetPhoto = (url: string) => {
    setChatPhotos(prev => [...prev, url]);
    message.success('Фото прикреплено к сообщению');
  };

  const handleRemovePhoto = (index: number) => {
    setChatPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSendChatMessage = () => {
    if (!selectedChat) return;
    if (!chatInputText.trim() && chatPhotos.length === 0) {
      message.warning('Введите текст сообщения или прикрепите фото');
      return;
    }
    dataStore.sendChatMessage(selectedChat.id, chatInputText.trim(), chatPhotos);
    setChatInputText('');
    setChatPhotos([]);
    message.success('Сообщение и фото отправлены покупателю');
    loadData();
  };

  // Template Management Handlers & Active Lists
  const activeFolders = templateModalTab === 'chat'
    ? chatFolders
    : templateModalTab === 'review'
    ? reviewFolders
    : questionFolders;

  const activeAllItems = templateModalTab === 'chat'
    ? chatTemplateItems
    : templateModalTab === 'review'
    ? reviewTemplateItems
    : questionTemplateItems;

  const activeModalTemplates = useMemo(() => {
    if (selectedFolder === 'all') return activeAllItems;
    return activeAllItems.filter(item => item.folder === selectedFolder);
  }, [activeAllItems, selectedFolder]);

  const filteredChatTemplates = useMemo(() => {
    if (chatQuickFolder === 'all') return chatTemplateItems;
    return chatTemplateItems.filter(t => t.folder === chatQuickFolder);
  }, [chatTemplateItems, chatQuickFolder]);

  const activeReplyAllTemplates = replyItem?.type === 'review' ? reviewTemplateItems : questionTemplateItems;
  const activeReplyFolders = replyItem?.type === 'review' ? reviewFolders : questionFolders;
  const filteredReplyTemplates = useMemo(() => {
    if (replyQuickFolder === 'all') return activeReplyAllTemplates;
    return activeReplyAllTemplates.filter(t => t.folder === replyQuickFolder);
  }, [activeReplyAllTemplates, replyQuickFolder]);

  const handleOpenTemplateEditor = (category: 'chat' | 'review' | 'question' = 'chat') => {
    setTemplateModalTab(category);
    setSelectedFolder('all');
    setNewTemplateText('');
    setTemplateModalOpen(true);
  };

  const handleAddTemplate = () => {
    if (!newTemplateText.trim()) {
      message.warning('Введите текст шаблона');
      return;
    }
    const folder = newTemplateFolder.trim() || 'Общие';
    dataStore.addTemplateItem(templateModalTab, newTemplateText.trim(), folder);
    setNewTemplateText('');
    message.success(`Шаблон добавлен в папку «${folder}»`);
    loadData();
  };

  const handleDeleteTemplate = (id: string) => {
    dataStore.deleteTemplateItem(templateModalTab, id);
    message.success('Шаблон удален');
    loadData();
  };

  const handleClearAllTemplates = () => {
    if (selectedFolder !== 'all') {
      dataStore.clearAllTemplateItems(templateModalTab, selectedFolder);
      message.success(`Все шаблоны в папке «${selectedFolder}» удалены`);
    } else {
      dataStore.clearAllTemplateItems(templateModalTab);
      message.success('Все шаблоны в этой вкладке удалены');
    }
    loadData();
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      message.warning('Введите название папки');
      return;
    }
    const name = newFolderName.trim();
    dataStore.addTemplateFolder(templateModalTab, name);
    setNewTemplateFolder(name);
    setSelectedFolder(name);
    setNewFolderName('');
    setShowNewFolderModal(false);
    message.success(`Папка «${name}» создана`);
    loadData();
  };

  const handleDeleteFolder = (folderName: string) => {
    if (folderName === 'Общие') {
      message.warning('Нельзя удалить базовую папку «Общие»');
      return;
    }
    dataStore.deleteTemplateFolder(templateModalTab, folderName);
    if (selectedFolder === folderName) setSelectedFolder('all');
    if (newTemplateFolder === folderName) setNewTemplateFolder('Общие');
    message.info(`Папка «${folderName}» удалена (шаблоны перенесены в «Общие»)`);
    loadData();
  };

  const handleDropTemplate = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const sourceItem = activeModalTemplates[draggedIndex];
    const targetItem = activeModalTemplates[targetIndex];
    if (!sourceItem || !targetItem) return;

    const fullSourceIdx = activeAllItems.findIndex(it => it.id === sourceItem.id);
    const fullTargetIdx = activeAllItems.findIndex(it => it.id === targetItem.id);

    if (fullSourceIdx !== -1 && fullTargetIdx !== -1) {
      dataStore.reorderTemplateItems(templateModalTab, fullSourceIdx, fullTargetIdx);
      message.success('Порядок шаблонов обновлен');
      loadData();
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Store Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }} className="text-slate-900 dark:text-white font-bold tracking-tight">
            Единое окно маркетплейсов
          </Title>
          <Text className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Прямые диалоги с покупателями, официальные ответы на отзывы и вопросы (Ozon, Wildberries, Яндекс)
          </Text>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<SettingOutlined />}
            onClick={() => handleOpenTemplateEditor('chat')}
            className="rounded-xl font-medium text-xs shadow-sm"
          >
            Шаблоны ответов
          </Button>
        </div>
      </div>

      {/* External API Connection Status Monitoring */}
      <ConnectionStatusBar mode="banner" />

      {/* 3 Marketplace Store Cards */}
      <Row gutter={[16, 16]}>
        {Object.entries(MARKETPLACE_LINKS).map(([key, item]) => (
          <Col xs={24} md={8} key={key}>
            <div className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group hover:shadow-md ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Магазин: «{item.brand}»
                    </div>
                  </div>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition"
                >
                  Витрина <LinkOutlined />
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-amber-500 font-bold">★ {item.rating}</span>
                  <span className="text-slate-400">({item.reviewsCount} отзывов)</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircleOutlined /> Активен
                </span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Control Bar: Mode switch & Filter pills */}
      <div className={`p-3 sm:p-4 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Main Segmented Switch */}
          <Segmented
            value={activeTab}
            onChange={v => setActiveTab(v as any)}
            options={[
              {
                label: (
                  <div className="flex items-center gap-2 py-1 px-1">
                    <CommentOutlined />
                    <span>Чаты</span>
                    {unreadChatsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-600 text-white">
                        {unreadChatsCount}
                      </span>
                    )}
                  </div>
                ),
                value: 'chats',
              },
              {
                label: (
                  <div className="flex items-center gap-2 py-1 px-1">
                    <StarOutlined />
                    <span>Отзывы</span>
                    {pendingReviewsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white">
                        {pendingReviewsCount}
                      </span>
                    )}
                  </div>
                ),
                value: 'reviews',
              },
              {
                label: (
                  <div className="flex items-center gap-2 py-1 px-1">
                    <QuestionCircleOutlined />
                    <span>Вопросы</span>
                    {pendingQuestionsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-purple-600 text-white">
                        {pendingQuestionsCount}
                      </span>
                    )}
                  </div>
                ),
                value: 'questions',
              },
            ]}
            className="p-1 rounded-xl font-semibold border border-slate-200 dark:border-slate-800"
          />

          {/* Filters: Marketplace selector & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* MP Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedMp('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedMp === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Все каналы
              </button>
              <button
                type="button"
                onClick={() => setSelectedMp('ozon')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedMp === 'ozon'
                    ? 'bg-[#005bff] text-white shadow-sm'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                Ozon
              </button>
              <button
                type="button"
                onClick={() => setSelectedMp('wildberries')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedMp === 'wildberries'
                    ? 'bg-[#cb11ab] text-white shadow-sm'
                    : 'text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/40'
                }`}
              >
                WB
              </button>
              <button
                type="button"
                onClick={() => setSelectedMp('yandex')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedMp === 'yandex'
                    ? 'bg-[#fc3f1d] text-white shadow-sm'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                }`}
              >
                Яндекс
              </button>
            </div>

            <Input
              placeholder="Поиск по покупателю, товару или тексту..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              className="w-full sm:w-60 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}

      {/* 1. CHATS TAB */}
      {activeTab === 'chats' && (
        <div className={`rounded-2xl border overflow-hidden transition-all grid grid-cols-1 md:grid-cols-12 min-h-[560px] ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          {/* Left: Chats List */}
          <div className={`md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-500">
              Диалоги с покупателями ({filteredChats.length})
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto flex-1 max-h-[520px]">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Нет диалогов по заданным фильтрам
                </div>
              ) : (
                filteredChats.map(c => {
                  const mp = MARKETPLACE_LINKS[c.marketplace];
                  const isSelected = selectedChat?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedChat(c);
                        c.unread_count = 0;
                      }}
                      className={`p-3.5 cursor-pointer transition-all duration-150 relative ${
                        isSelected 
                          ? isDark 
                            ? 'bg-blue-950/30 border-l-4 border-blue-500' 
                            : 'bg-blue-50/70 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="text-[10px] px-1.5 py-0.2 rounded font-black text-white"
                            style={{ backgroundColor: mp.color }}
                          >
                            {mp.name}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">
                            {c.buyer_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {c.last_message_date.split(' ')[1]}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate mb-1">
                        🪨 {c.product_title}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate pr-2">{c.last_message}</span>
                        {c.unread_count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-600 text-white flex-shrink-0">
                            +{c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat Conversation */}
          <div className={`md:col-span-8 flex-col justify-between h-full min-h-[520px] ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat Top Header */}
                <div className={`p-4 border-b border-slate-200 dark:border-slate-800 ${
                  isDark ? 'bg-slate-950/40' : 'bg-slate-50/80'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Button 
                        type="text" 
                        icon={<LeftOutlined />} 
                        className="md:hidden p-0 w-8 h-8 flex items-center justify-center -ml-2 text-slate-500 hover:bg-slate-200/50" 
                        onClick={() => setSelectedChat(null)} 
                      />
                      <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: MARKETPLACE_LINKS[selectedChat.marketplace].color }}
                        className="font-bold shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {selectedChat.buyer_name}
                          </span>
                          <Tag 
                            className="m-0 text-[10px] font-bold border-0 px-2 rounded-full"
                            style={{ 
                              backgroundColor: `${MARKETPLACE_LINKS[selectedChat.marketplace].color}22`,
                              color: MARKETPLACE_LINKS[selectedChat.marketplace].color
                            }}
                          >
                            Чат {MARKETPLACE_LINKS[selectedChat.marketplace].name}
                          </Tag>
                          {selectedChat.linked_order_number && (
                            <Tag color="success" className="m-0 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <CheckCircleOutlined /> Заказ {selectedChat.linked_order_number} оформлен
                            </Tag>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                          Товар: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedChat.product_title}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleOpenOrderFromChat}
                        className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 shadow-sm"
                      >
                        Оформить заказ из чата
                      </Button>

                      <a
                        href={MARKETPLACE_LINKS[selectedChat.marketplace].url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline font-semibold hidden sm:inline"
                      >
                        Витрина ↗
                      </a>
                    </div>
                  </div>

                  {/* Customer Recognition strip */}
                  {(() => {
                    const cust = selectedChat.customer_id 
                      ? dataStore.getCustomerById(selectedChat.customer_id) 
                      : dataStore.getCustomers().find(c => c.name.toLowerCase() === selectedChat.buyer_name.toLowerCase());
                    if (!cust) return null;
                    return (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <UserOutlined /> Клиент в базе:
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{cust.name}</span>
                          <Tag color="cyan" className="m-0 text-[9px] font-bold py-0 px-1 rounded">
                            {cust.orders_count} {cust.orders_count === 1 ? 'заказ' : 'заказа'}
                          </Tag>
                          <span>LTV: <strong className="text-emerald-600 font-mono">{cust.total_spent.toLocaleString('ru-RU')} ₽</strong></span>
                          {cust.city && <span>г. {cust.city}</span>}
                        </div>

                        <Button 
                          size="small" 
                          type="link" 
                          onClick={() => navigate('/customers')}
                          className="text-[11px] p-0 h-auto font-semibold"
                        >
                          В карточку клиента →
                        </Button>
                      </div>
                    );
                  })()}
                </div>

                {/* Messages Thread */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[380px] bg-slate-50/30 dark:bg-slate-950/20">
                  {selectedChat.messages.map(m => {
                    const isSeller = m.sender === 'seller';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isSeller
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : isDark
                            ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                        }`}>
                          {m.text && <p className="m-0 leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                          {m.photos && m.photos.length > 0 && (
                            <div className={`mt-2 ${m.text ? 'pt-2 border-t border-white/20 dark:border-slate-700' : ''}`}>
                              <Image.PreviewGroup>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.photos.map((photoUrl, pIdx) => (
                                    <div key={pIdx} className="relative rounded-lg overflow-hidden border border-white/30 dark:border-slate-700 shadow-xs">
                                      <Image
                                        src={photoUrl}
                                        alt={`Вложение ${pIdx + 1}`}
                                        width={m.photos!.length === 1 ? 180 : 84}
                                        height={m.photos!.length === 1 ? 130 : 84}
                                        className="object-cover cursor-pointer hover:scale-105 transition-transform"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </Image.PreviewGroup>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {isSeller ? 'Вы (Каменный Ручей)' : selectedChat.buyer_name} · {m.date}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Reply Chips with Folder filtering */}
                <div className="px-3 pt-2 pb-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1 overflow-x-auto">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
                        <ThunderboltOutlined className="text-amber-500" /> Шаблоны:
                      </span>
                      <button
                        type="button"
                        onClick={() => setChatQuickFolder('all')}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium cursor-pointer transition flex-shrink-0 ${
                          chatQuickFolder === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        Все ({chatTemplateItems.length})
                      </button>
                      {chatFolders.map(f => {
                        const count = chatTemplateItems.filter(t => t.folder === f).length;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setChatQuickFolder(f)}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium cursor-pointer transition flex-shrink-0 ${
                              chatQuickFolder === f
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {f} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <Tooltip title="Настроить папки, шаблоны и порядок">
                      <button
                        type="button"
                        onClick={() => handleOpenTemplateEditor('chat')}
                        className="text-[11px] px-2 py-0.5 rounded-md border border-dashed border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1 flex-shrink-0 transition cursor-pointer font-medium"
                      >
                        <SettingOutlined className="text-[10px]" /> Редактор шаблонов
                      </button>
                    </Tooltip>
                  </div>

                  {/* Template buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {filteredChatTemplates.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        {chatTemplateItems.length === 0 ? 'Шаблонов пока нет. Откройте редактор для добавления!' : 'В этой папке пока нет шаблонов'}
                      </span>
                    ) : (
                      filteredChatTemplates.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setChatInputText(tpl.text)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-500 truncate max-w-[220px] transition cursor-pointer flex-shrink-0 text-left"
                          title={tpl.text}
                        >
                          {tpl.text}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Input box */}
                <div>
                  {/* Photo attachments preview strip */}
                  {chatPhotos.length > 0 && (
                    <div className="px-3 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-t border-blue-200/60 dark:border-blue-900/50 flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0 uppercase tracking-wider">
                        📷 Прикреплено ({chatPhotos.length}):
                      </span>
                      {chatPhotos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative group shrink-0">
                          <img 
                            src={photo} 
                            alt="preview" 
                            className="w-12 h-12 object-cover rounded-lg border border-blue-300 dark:border-blue-700 shadow-xs" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600 cursor-pointer"
                            title="Удалить фото"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <Button
                        size="small"
                        type="dashed"
                        onClick={() => setChatPhotos([])}
                        className="text-[10px] h-6 px-1.5 text-red-500 hover:text-red-600"
                      >
                        Очистить все
                      </Button>
                    </div>
                  )}

                  {/* Input controls & quick photo presets */}
                  <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileAttach}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    <div className="flex items-center gap-1.5">
                      {/* Attach Photo from device/camera */}
                      <Tooltip title="Прикрепить фото из галереи или камеры">
                        <Button
                          icon={<CameraOutlined className="text-base text-blue-600 dark:text-blue-400" />}
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl flex items-center justify-center shrink-0 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        />
                      </Tooltip>

                      {/* Fast stone sample photo presets */}
                      <div className="hidden sm:flex items-center gap-1 overflow-x-auto text-[10px]">
                        <span className="text-slate-400 text-[10px] shrink-0">Быстрое фото:</span>
                        <button
                          type="button"
                          onClick={() => handleAttachPresetPhoto('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')}
                          className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer transition"
                        >
                          🪨 Готовая полка
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttachPresetPhoto('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80')}
                          className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer transition"
                        >
                          📦 Упаковка в СДЭК
                        </button>
                      </div>

                      <Input
                        placeholder="Напишите ответ или прикрепите фото..."
                        value={chatInputText}
                        onChange={e => setChatInputText(e.target.value)}
                        onPressEnter={handleSendChatMessage}
                        className="rounded-xl flex-1 text-xs sm:text-sm"
                      />

                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendChatMessage}
                        className="bg-blue-600 hover:bg-blue-500 rounded-xl px-3 sm:px-4 font-semibold shrink-0 shadow-sm"
                      >
                        <span className="hidden sm:inline">Отправить</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                Выберите диалог из списка слева
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-500 font-medium">
              Официальные ответы мастерской на отзывы покупателей
            </span>
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleOpenTemplateEditor('review')}
              className="rounded-lg text-xs"
            >
              Настроить шаблоны отзывов
            </Button>
          </div>

          {filteredReviews.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border text-slate-400 text-sm ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              Отзывов не найдено
            </div>
          ) : (
            filteredReviews.map(rev => {
              const mp = MARKETPLACE_LINKS[rev.marketplace];
              return (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl border transition-all duration-150 ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Tag 
                        className="font-bold text-xs py-0.5 px-2.5 rounded-full border-0 text-white"
                        style={{ backgroundColor: mp.color }}
                      >
                        {mp.name}
                      </Tag>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {rev.author}
                      </span>
                      <Rate disabled defaultValue={rev.rating} className="text-sm" />
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      {rev.review_date}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-blue-600 dark:text-blue-400 mb-2">
                    🪨 Товар: {rev.product_name}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
                    {rev.text}
                  </p>

                  {(rev.pros || rev.cons) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                      {rev.pros && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <span className="font-bold">Плюсы:</span> {rev.pros}
                        </div>
                      )}
                      {rev.cons && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                          <span className="font-bold">Минусы:</span> {rev.cons}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply Section */}
                  {rev.is_answered ? (
                    <div className={`p-3.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircleOutlined /> Ответ представителя «Каменный Ручей»:
                      </div>
                      <p className="m-0 leading-relaxed italic">{rev.reply_text}</p>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-2">
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => handleOpenReply(rev.id, 'review', rev.author, rev.text, rev.product_name)}
                        className="bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-xs shadow-sm"
                      >
                        Ответить на отзыв
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. QUESTIONS TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-500 font-medium">
              Вопросы потенциальных покупателей перед оформлением заказа
            </span>
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleOpenTemplateEditor('question')}
              className="rounded-lg text-xs"
            >
              Настроить шаблоны вопросов
            </Button>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border text-slate-400 text-sm ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              Вопросов не найдено
            </div>
          ) : (
            filteredQuestions.map(qItem => {
              const mp = MARKETPLACE_LINKS[qItem.marketplace];
              return (
                <div
                  key={qItem.id}
                  className={`p-5 rounded-2xl border transition-all duration-150 ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Tag 
                        className="font-bold text-xs py-0.5 px-2.5 rounded-full border-0 text-white"
                        style={{ backgroundColor: mp.color }}
                      >
                        {mp.name}
                      </Tag>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Вопрос от: {qItem.author}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      {qItem.question_date}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-blue-600 dark:text-blue-400 mb-2">
                    🪨 Товар: {qItem.product_name}
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-3">
                    «{qItem.question_text}»
                  </p>

                  {/* Answer Section */}
                  {qItem.is_answered ? (
                    <div className={`p-3.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircleOutlined /> Ответ мастерской «Каменный Ручей»:
                      </div>
                      <p className="m-0 leading-relaxed">{qItem.answer_text}</p>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-2">
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => handleOpenReply(qItem.id, 'question', qItem.author, qItem.question_text, qItem.product_name)}
                        className="bg-purple-600 hover:bg-purple-500 rounded-xl font-medium text-xs shadow-sm"
                      >
                        Ответить покупателю
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reply Modal (Reviews & Questions) */}
      <Modal
        title={
          replyItem?.type === 'review'
            ? 'Официальный ответ на отзыв покупателя'
            : 'Ответ на вопрос покупателя о товаре'
        }
        open={replyModalOpen}
        onOk={handleSendReply}
        onCancel={() => setReplyModalOpen(false)}
        okText="Опубликовать ответ"
        cancelText="Отмена"
        width={600}
        centered
      >
        {replyItem && (
          <div className="mt-3 space-y-3">
            <div className={`p-3 rounded-xl border text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                {replyItem.author} о товаре «{replyItem.product}»:
              </div>
              <div className="italic text-slate-600 dark:text-slate-400">
                «{replyItem.text}»
              </div>
            </div>

            {/* Quick Templates for current modal category */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 overflow-x-auto">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
                    <ThunderboltOutlined className="text-amber-500" /> Шаблоны:
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyQuickFolder('all')}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer transition flex-shrink-0 ${
                      replyQuickFolder === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Все ({activeReplyAllTemplates.length})
                  </button>
                  {activeReplyFolders.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setReplyQuickFolder(f)}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer transition flex-shrink-0 ${
                        replyQuickFolder === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenTemplateEditor(replyItem.type === 'review' ? 'review' : 'question')}
                  className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <SettingOutlined className="text-[10px]" /> Настроить
                </button>
              </div>

              {filteredReplyTemplates.length === 0 ? (
                <div className="p-3 text-center border border-dashed rounded-xl text-xs text-slate-400">
                  {activeReplyAllTemplates.length === 0 ? 'Шаблонов пока нет.' : 'В этой папке пока нет шаблонов.'}{' '}
                  <button
                    type="button"
                    onClick={() => handleOpenTemplateEditor(replyItem.type === 'review' ? 'review' : 'question')}
                    className="text-blue-500 hover:underline font-semibold cursor-pointer"
                  >
                    + Добавить шаблон
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
                  {filteredReplyTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setReplyText(tpl.text)}
                      className="text-left text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-300 flex items-start justify-between gap-2"
                    >
                      <span className="leading-relaxed flex-1">{tpl.text}</span>
                      <Tag color="blue" className="text-[9px] m-0 flex-shrink-0">{tpl.folder}</Tag>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Текст ответа:
              </span>
              <TextArea
                rows={4}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Напишите вежливый и подробный ответ..."
                className="rounded-xl"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* TEMPLATE MANAGEMENT MODAL (Folders, Drag & Drop, Compact Clear) */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold">
            <SettingOutlined className="text-blue-500" />
            <span>Редактор шаблонов и папок</span>
          </div>
        }
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        footer={[
          <Popconfirm
            key="clear"
            title={selectedFolder !== 'all' ? `Очистить шаблоны в папке «${selectedFolder}»?` : "Очистить все шаблоны в этой вкладке?"}
            description="Действие необратимо. Будут удалены соответствующие шаблоны."
            onConfirm={handleClearAllTemplates}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Button 
              size="small" 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              className="text-xs text-rose-500 hover:text-rose-600 mr-auto opacity-75 hover:opacity-100"
            >
              {selectedFolder !== 'all' ? `Очистить папку «${selectedFolder}»` : 'Удалить все шаблоны'}
            </Button>
          </Popconfirm>,
          <Button key="close" type="primary" onClick={() => setTemplateModalOpen(false)} className="rounded-lg">
            Готово
          </Button>
        ]}
        width={720}
        centered
      >
        <div className="mt-2 space-y-4">
          <Tabs
            activeKey={templateModalTab}
            onChange={k => {
              setTemplateModalTab(k as any);
              setSelectedFolder('all');
            }}
            items={[
              {
                key: 'chat',
                label: (
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CommentOutlined /> Для чатов ({chatTemplateItems.length})
                  </span>
                ),
              },
              {
                key: 'review',
                label: (
                  <span className="flex items-center gap-1.5 font-semibold">
                    <StarOutlined /> Для отзывов ({reviewTemplateItems.length})
                  </span>
                ),
              },
              {
                key: 'question',
                label: (
                  <span className="flex items-center gap-1.5 font-semibold">
                    <QuestionCircleOutlined /> Для вопросов ({questionTemplateItems.length})
                  </span>
                ),
              },
            ]}
          />

          {/* Folders Management Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FolderOutlined className="text-amber-500" /> Папки шаблонов:
              </span>
              <Button
                size="small"
                type="dashed"
                icon={<FolderAddOutlined />}
                onClick={() => setShowNewFolderModal(true)}
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                + Новая папка
              </Button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedFolder('all')}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium cursor-pointer transition flex items-center gap-1 ${
                  selectedFolder === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Все ({activeAllItems.length})
              </button>

              {activeFolders.map(folder => {
                const count = activeAllItems.filter(it => it.folder === folder).length;
                const isSelected = selectedFolder === folder;
                return (
                  <div
                    key={folder}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span onClick={() => setSelectedFolder(folder)}>
                      📁 {folder} ({count})
                    </span>

                    {folder !== 'Общие' && (
                      <Popconfirm
                        title={`Удалить папку «${folder}»?`}
                        description="Шаблоны из этой папки будут перемещены в «Общие»."
                        onConfirm={() => handleDeleteFolder(folder)}
                        okText="Удалить"
                        cancelText="Отмена"
                      >
                        <CloseCircleOutlined className="text-[11px] opacity-40 hover:opacity-100 ml-0.5 hover:text-rose-400" />
                      </Popconfirm>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Template Input Box */}
          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                + Добавить новый шаблон:
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">Папка:</span>
                <Select
                  size="small"
                  value={newTemplateFolder}
                  onChange={v => setNewTemplateFolder(v)}
                  className="w-44"
                >
                  {activeFolders.map(f => (
                    <Select.Option key={f} value={f}>
                      📁 {f}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <TextArea
              rows={2}
              value={newTemplateText}
              onChange={e => setNewTemplateText(e.target.value)}
              placeholder="Введите текст шаблона, который часто используете..."
              className="rounded-xl text-xs"
            />

            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[11px] text-slate-400">
                💡 Шаблоны можно менять местами перетаскиванием (drag & drop)
              </span>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddTemplate}
                className="bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold"
              >
                Сохранить шаблон
              </Button>
            </div>
          </div>

          {/* Existing Templates List with Drag & Drop */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {selectedFolder === 'all' ? 'Все шаблоны' : `Папка «${selectedFolder}»`} ({activeModalTemplates.length}):
              </span>
              <span className="text-[10px] text-slate-400">
                Зажмите и тяните за иконку для изменения порядка
              </span>
            </div>

            {activeModalTemplates.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed rounded-xl">
                В этой папке пока нет шаблонов. Введите текст выше и сохраните!
              </div>
            ) : (
              activeModalTemplates.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedIndex(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleDropTemplate(idx);
                  }}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition select-none group ${
                    draggedIndex === idx
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 opacity-60'
                      : isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div 
                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-500 pt-0.5 flex-shrink-0 px-0.5"
                      title="Перетащите для изменения порядка"
                    >
                      <HolderOutlined />
                    </div>

                    <span className="font-bold text-slate-400 mt-0.5 font-mono text-[11px]">#{idx + 1}</span>

                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="m-0 leading-relaxed break-words">{item.text}</p>
                      <Tag color="cyan" className="text-[9px] font-normal py-0 px-1 rounded">
                        📁 {item.folder}
                      </Tag>
                    </div>
                  </div>

                  <Popconfirm
                    title="Удалить этот шаблон?"
                    onConfirm={() => handleDeleteTemplate(item.id)}
                    okText="Удалить"
                    cancelText="Отмена"
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      className="opacity-40 group-hover:opacity-100 hover:opacity-100 flex-shrink-0"
                    />
                  </Popconfirm>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: CREATE NEW FOLDER */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold">
            <FolderAddOutlined className="text-blue-500" />
            <span>Создать новую папку шаблонов</span>
          </div>
        }
        open={showNewFolderModal}
        onCancel={() => {
          setShowNewFolderModal(false);
          setNewFolderName('');
        }}
        onOk={handleCreateFolder}
        okText="Создать"
        cancelText="Отмена"
        width={380}
        centered
      >
        <div className="pt-2 space-y-2">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Название папки (например, «Акции и скидки», «Оплата», «Претензии»):
          </span>
          <Input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onPressEnter={handleCreateFolder}
            placeholder="Введите название..."
            className="rounded-xl"
            autoFocus
          />
        </div>
      </Modal>

      {/* Modal: Оформить заказ из чата маркетплейса */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined className="text-blue-600 text-lg" />
            <span className="font-bold text-base">Оформить заказ из переписки</span>
          </div>
        }
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        footer={null}
        width={580}
        destroyOnClose
      >
        <Form
          form={orderForm}
          layout="vertical"
          onFinish={handleCreateOrderSubmit}
          className="pt-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item 
              label="Имя покупателя" 
              name="client_name" 
              rules={[{ required: true, message: 'Укажите имя' }]}
              className="mb-2"
            >
              <Input className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item 
              label="Телефон" 
              name="client_phone" 
              className="mb-2"
            >
              <Input placeholder="+7 (___) ___-__-__" className="rounded-xl text-xs" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item 
              label="Город доставки" 
              name="delivery_city" 
              rules={[{ required: true, message: 'Укажите город' }]}
              className="mb-2"
            >
              <Input placeholder="Москва" className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item 
              label="Адрес / ПВЗ СДЭК" 
              name="delivery_address" 
              className="mb-2"
            >
              <Input placeholder="ул. Ленина 24, кв. 10 или код ПВЗ" className="rounded-xl text-xs" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item 
              label="Порода камня" 
              name="stone_type" 
              rules={[{ required: true, message: 'Выберите камень' }]}
              className="mb-2"
            >
              <Input className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item 
              label="Габариты (ДхШхТ мм)" 
              name="dimensions" 
              rules={[{ required: true, message: 'Укажите размеры' }]}
              className="mb-2"
            >
              <Input placeholder="600х150х20 мм" className="rounded-xl text-xs" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item 
              label="Сумма заказа (₽)" 
              name="total_price" 
              rules={[{ required: true, message: 'Укажите сумму' }]}
              className="mb-2"
            >
              <InputNumber style={{ width: '100%' }} className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item 
              label="Предоплата (₽)" 
              name="prepayment_amount" 
              className="mb-2"
            >
              <InputNumber style={{ width: '100%' }} className="rounded-xl text-xs" />
            </Form.Item>
          </div>

          <Form.Item label="Примечание к заказу" name="notes" className="mb-4">
            <TextArea rows={2} className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setOrderModalOpen(false)} className="rounded-xl text-xs">
              Отмена
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<ShoppingCartOutlined />}
              className="bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-xs shadow-sm"
            >
              Создать заказ в CRM
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Messages;
