'''
Business: Управление настройками тарификации (получение и обновление)
Args: event - dict with httpMethod, body (для POST), queryStringParameters
      context - object with request_id
Returns: HTTP response with pricing settings
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
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
    
    if method == 'GET':
        cur.execute("SELECT enabled, price, updated_at FROM pricing_settings WHERE id = 1")
        row = cur.fetchone()
        
        if not row:
            cur.execute("INSERT INTO pricing_settings (id, enabled, price) VALUES (1, FALSE, 99)")
            conn.commit()
            result = {'enabled': False, 'price': 99, 'updated_at': None}
        else:
            result = {
                'enabled': row[0],
                'price': row[1],
                'updated_at': row[2].isoformat() if row[2] else None
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        enabled: bool = body_data.get('enabled', False)
        price: int = body_data.get('price', 99)
        
        cur.execute(
            """
            UPDATE pricing_settings 
            SET enabled = %s, price = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = 1
            RETURNING enabled, price, updated_at
            """,
            (enabled, price)
        )
        
        row = cur.fetchone()
        conn.commit()
        
        result = {
            'enabled': row[0],
            'price': row[1],
            'updated_at': row[2].isoformat() if row[2] else None
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
