'''
Business: Получение статистики парсингов для админ-панели
Args: event - dict with httpMethod
      context - object with request_id
Returns: HTTP response with statistics (total, today, revenue)
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

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
    
    cur.execute("SELECT COUNT(*) FROM parsings")
    total_parsings = cur.fetchone()[0]
    
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    cur.execute(
        "SELECT COUNT(*) FROM parsings WHERE created_at >= %s",
        (today_start,)
    )
    today_parsings = cur.fetchone()[0]
    
    cur.execute("SELECT COALESCE(SUM(price_paid), 0) FROM parsings")
    total_revenue = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'total_parsings': total_parsings,
            'today_parsings': today_parsings,
            'total_revenue': total_revenue
        }),
        'isBase64Encoded': False
    }
