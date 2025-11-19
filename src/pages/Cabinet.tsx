import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Parsing {
  id: number;
  avito_url: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  ad_title: string;
  ad_description: string;
  price_paid: number;
  status: string;
  created_at: string;
}

const Cabinet = () => {
  const [parsings, setParsings] = useState<Parsing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const userId = 1;

  useEffect(() => {
    fetchParsings();
  }, []);

  const fetchParsings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/0d5aee80-2a28-4c5f-a362-990b727cb516?user_id=${userId}`
      );
      const data = await response.json();
      setParsings(data.parsings || []);
    } catch (error) {
      console.error('Error fetching parsings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Личный <span className="gradient-text">кабинет</span>
            </h1>
            <p className="text-gray-600">История парсингов и контакты</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        <div className="grid gap-4 mb-8 md:grid-cols-3">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Всего парсингов</p>
                  <p className="text-3xl font-bold text-purple-900">{parsings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="FileText" size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Потрачено</p>
                  <p className="text-3xl font-bold text-pink-900">
                    {parsings.reduce((sum, p) => sum + p.price_paid, 0)} ₽
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <Icon name="Wallet" size={24} className="text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Сегодня</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {parsings.filter(p => {
                      const today = new Date().toDateString();
                      return new Date(p.created_at).toDateString() === today;
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Icon name="Calendar" size={24} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Icon name="Loader2" size={48} className="animate-spin text-purple-600" />
          </div>
        ) : parsings.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="py-20 text-center">
              <Icon name="Inbox" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Парсингов пока нет
              </h3>
              <p className="text-gray-500 mb-6">
                Начните парсить объявления на главной странице
              </p>
              <Button
                onClick={() => navigate('/')}
                className="gradient-primary hover:opacity-90"
              >
                Начать парсинг
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {parsings.map((parsing) => (
              <Card
                key={parsing.id}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover-scale"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {parsing.ad_title}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          {parsing.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Icon name="Clock" size={14} />
                        {formatDate(parsing.created_at)}
                      </CardDescription>
                    </div>
                    {parsing.price_paid > 0 && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-900">{parsing.price_paid} ₽</p>
                        <p className="text-xs text-gray-500">Оплачено</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={20} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Имя</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{parsing.contact_name}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(parsing.contact_name)}
                            >
                              <Icon name="Copy" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="Phone" size={20} className="text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Телефон</p>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${parsing.contact_phone}`}
                              className="font-semibold text-pink-600 hover:text-pink-700 truncate"
                            >
                              {parsing.contact_phone}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(parsing.contact_phone)}
                            >
                              <Icon name="Copy" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="Mail" size={20} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Email</p>
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${parsing.contact_email}`}
                              className="font-semibold text-orange-600 hover:text-orange-700 truncate"
                            >
                              {parsing.contact_email}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(parsing.contact_email)}
                            >
                              <Icon name="Copy" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="MapPin" size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Адрес</p>
                          <p className="font-semibold text-gray-800">{parsing.contact_address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="Link" size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Объявление</p>
                          <a
                            href={parsing.avito_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-700 underline truncate block"
                          >
                            Открыть на Авито
                          </a>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Описание</p>
                        <p className="text-sm text-gray-800">{parsing.ad_description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cabinet;
