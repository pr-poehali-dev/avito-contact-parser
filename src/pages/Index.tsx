import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PricingSettings {
  enabled: boolean;
  price: number;
}

const Index = () => {
  const [avitoUrl, setAvitoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    enabled: false,
    price: 99,
  });
  const [stats, setStats] = useState({ total_parsings: 0, today_parsings: 0, total_revenue: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = 1;

  useEffect(() => {
    fetchPricingSettings();
    if (isAdminMode) {
      fetchStats();
    }
  }, [isAdminMode]);

  const fetchPricingSettings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/98ba991a-11cd-4038-9071-2dc57d80506a');
      const data = await response.json();
      setPricingSettings({ enabled: data.enabled, price: data.price });
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/84745f53-8258-4a60-89f6-715cba449803');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleParse = async () => {
    if (!avitoUrl.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ссылку на объявление',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/c7148b16-3ad0-4032-a1be-3a138741c37a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avito_url: avitoUrl,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно!',
          description: `Контакты извлечены: ${data.contact.name}${data.price_paid > 0 ? ` (${data.price_paid} ₽)` : ''}`,
        });
        setAvitoUrl('');
        
        setTimeout(() => {
          navigate('/cabinet');
        }, 1500);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выполнить парсинг',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка подключения к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePricingUpdate = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/98ba991a-11cd-4038-9071-2dc57d80506a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: pricingSettings.enabled,
          price: pricingSettings.price,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Настройки сохранены',
          description: pricingSettings.enabled 
            ? `Парсинг теперь платный: ${pricingSettings.price} ₽` 
            : 'Парсинг теперь бесплатный',
        });
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/cabinet')}
          className="gap-2"
        >
          <Icon name="User" size={16} />
          Личный кабинет
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdminMode(!isAdminMode)}
          className="gap-2"
        >
          <Icon name={isAdminMode ? 'User' : 'Shield'} size={16} />
          {isAdminMode ? 'Режим пользователя' : 'Админ'}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6">
            <span className="gradient-text font-bold text-sm">✨ НОВЫЙ СЕРВИС</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Парсинг контактов
            <br />
            <span className="gradient-text">с Авито</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Автоматически извлекайте контактную информацию из объявлений Авито. 
            Быстро, удобно и эффективно для вашего бизнеса.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200">
              <Icon name="Zap" size={14} className="mr-1" />
              Мгновенный результат
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-pink-100 text-pink-700 hover:bg-pink-200">
              <Icon name="Shield" size={14} className="mr-1" />
              Безопасно
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200">
              <Icon name="Download" size={14} className="mr-1" />
              Экспорт данных
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover-scale shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                <Icon name="Search" size={24} className="text-white" />
              </div>
              <CardTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Парсинг объявлений
              </CardTitle>
              <CardDescription className="text-base">
                Вставьте ссылку на объявление и получите все контактные данные
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avito-url" className="text-sm font-medium">
                  Ссылка на объявление Авито
                </Label>
                <Input
                  id="avito-url"
                  type="url"
                  placeholder="https://www.avito.ru/..."
                  value={avitoUrl}
                  onChange={(e) => setAvitoUrl(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {pricingSettings.enabled && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-purple-900">Стоимость парсинга</p>
                      <p className="text-sm text-purple-700">За одно объявление</p>
                    </div>
                    <div className="text-3xl font-bold text-purple-900">{pricingSettings.price} ₽</div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleParse}
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="Play" size={20} className="mr-2" />
                    Начать парсинг
                  </>
                )}
              </Button>

              {!pricingSettings.enabled && (
                <p className="text-sm text-center text-green-600 font-medium">
                  <Icon name="Gift" size={16} className="inline mr-1" />
                  Бесплатный режим
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="hover-scale shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={24} className="text-white" />
              </div>
              <CardTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Поддержка
              </CardTitle>
              <CardDescription className="text-base">
                Нужна помощь? Мы всегда на связи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Icon name="Mail" size={20} className="text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:support@avitoparser.ru" className="text-sm text-gray-600 hover:text-purple-600">
                      support@avitoparser.ru
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Icon name="Phone" size={20} className="text-pink-600 mt-1" />
                  <div>
                    <p className="font-medium">Телефон</p>
                    <a href="tel:+79999999999" className="text-sm text-gray-600 hover:text-pink-600">
                      +7 (999) 999-99-99
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Icon name="MessageSquare" size={20} className="text-orange-600 mt-1" />
                  <div>
                    <p className="font-medium">Telegram</p>
                    <a href="https://t.me/support" className="text-sm text-gray-600 hover:text-orange-600">
                      @avito_parser_support
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <Icon name="Clock" size={16} className="inline mr-1" />
                  Время работы: Пн-Пт 9:00-18:00 МСК
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isAdminMode && (
          <Card className="shadow-2xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Icon name="Settings" size={24} className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Панель администратора
                  </CardTitle>
                  <CardDescription>Управление тарификацией сервиса</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="pricing-toggle" className="text-base font-semibold cursor-pointer">
                    Платный режим
                  </Label>
                  <p className="text-sm text-gray-600">
                    {pricingSettings.enabled 
                      ? 'Пользователи будут платить за парсинг' 
                      : 'Парсинг бесплатный для всех пользователей'}
                  </p>
                </div>
                <Switch
                  id="pricing-toggle"
                  checked={pricingSettings.enabled}
                  onCheckedChange={(checked) => 
                    setPricingSettings(prev => ({ ...prev, enabled: checked }))
                  }
                  className="data-[state=checked]:gradient-primary"
                />
              </div>

              {pricingSettings.enabled && (
                <div className="space-y-3 animate-fade-in">
                  <Label htmlFor="price-input" className="text-base font-semibold">
                    Стоимость за парсинг (₽)
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="price-input"
                      type="number"
                      min="0"
                      value={pricingSettings.price}
                      onChange={(e) => 
                        setPricingSettings(prev => ({ 
                          ...prev, 
                          price: parseInt(e.target.value) || 0 
                        }))
                      }
                      className="h-12 text-lg font-semibold"
                    />
                    <Button
                      onClick={handlePricingUpdate}
                      className="gradient-primary hover:opacity-90 px-8"
                    >
                      <Icon name="Check" size={20} className="mr-2" />
                      Сохранить
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Рекомендуемая цена: 50-150 ₽ за одно объявление
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-900">{stats.total_parsings}</p>
                  <p className="text-sm text-purple-700 mt-1">Всего парсингов</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-pink-900">{stats.today_parsings}</p>
                  <p className="text-sm text-pink-700 mt-1">Сегодня</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.total_revenue} ₽
                  </p>
                  <p className="text-sm text-orange-700 mt-1">Заработано</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-purple-600 transition-colors">О сервисе</a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600 transition-colors">Документация</a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600 transition-colors">Политика конфиденциальности</a>
          </div>
          <p className="mt-4 text-gray-500">© 2024 Avito Parser. Все права защищены.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;