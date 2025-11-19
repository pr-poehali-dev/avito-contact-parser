'''
Business: Получение истории парсингов для пользователя
Args: event - dict with httpMethod, queryStringParameters (user_id)
      context - object with request_id
Returns: HTTP response with list of parsings
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    user_id: int = int(params.get('user_id', 1))
    
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
    
    cur.execute(
        """
        SELECT id, avito_url, contact_name, contact_phone, contact_email,
               contact_address, ad_title, ad_description, price_paid, 
               status, created_at
        FROM parsings
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 100
        """,
        (user_id,)
    )
    
    rows = cur.fetchall()
    
    parsings = []
    for row in rows:
        parsings.append({
            'id': row[0],
            'avito_url': row[1],
            'contact_name': row[2],
            'contact_phone': row[3],
            'contact_email': row[4],
            'contact_address': row[5],
            'ad_title': row[6],
            'ad_description': row[7],
            'price_paid': row[8],
            'status': row[9],
            'created_at': row[10].isoformat() if row[10] else None
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'parsings': parsings,
            'total': len(parsings)
        }),
        'isBase64Encoded': False
    }
