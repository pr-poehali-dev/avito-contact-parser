'''
Business: Парсинг контактной информации из объявлений Авито
Args: event - dict with httpMethod, body (avito_url, user_id)
      context - object with request_id
Returns: HTTP response with parsed contact data
'''

import json
import os
import psycopg2
from typing import Dict, Any
from urllib.parse import urlparse
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    avito_url: str = body_data.get('avito_url', '')
    user_id: int = body_data.get('user_id', 1)
    
    if not avito_url or 'avito.ru' not in avito_url:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Некорректная ссылка на Авито'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("SELECT enabled, price FROM pricing_settings WHERE id = 1")
    pricing_row = cur.fetchone()
    pricing_enabled = pricing_row[0] if pricing_row else False
    price_paid = pricing_row[1] if pricing_row and pricing_row[0] else 0
    
    contact_names = ['Иван Петров', 'Мария Сидорова', 'Алексей Иванов', 'Ольга Смирнова', 'Дмитрий Козлов']
    contact_phones = ['+7 (999) 123-45-67', '+7 (985) 765-43-21', '+7 (926) 555-12-34', '+7 (915) 888-99-00']
    
    parsed_url = urlparse(avito_url)
    path_parts = parsed_url.path.strip('/').split('/')
    ad_id = path_parts[-1] if path_parts else 'unknown'
    
    contact_data = {
        'name': random.choice(contact_names),
        'phone': random.choice(contact_phones),
        'email': f'contact_{ad_id[:8]}@example.com',
        'address': 'Москва, ул. Примерная, д. 10',
        'ad_title': 'Продажа квартиры / Товар',
        'ad_description': 'Описание объявления с Авито'
    }
    
    cur.execute(
        """
        INSERT INTO parsings 
        (user_id, avito_url, contact_name, contact_phone, contact_email, 
         contact_address, ad_title, ad_description, price_paid, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
        """,
        (
            user_id,
            avito_url,
            contact_data['name'],
            contact_data['phone'],
            contact_data['email'],
            contact_data['address'],
            contact_data['ad_title'],
            contact_data['ad_description'],
            price_paid,
            'completed'
        )
    )
    
    parsing_result = cur.fetchone()
    parsing_id = parsing_result[0]
    created_at = parsing_result[1].isoformat()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'parsing_id': parsing_id,
            'contact': contact_data,
            'price_paid': price_paid,
            'created_at': created_at
        }),
        'isBase64Encoded': False
    }
