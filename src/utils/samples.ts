export interface SampleItem {
  id: string;
  name: string;
  description: string;
  format: string;
  content: string;
  category?: 'Core JSON' | 'Conversions' | 'Dev Tools' | 'AI & Analytics';
}

export const SAMPLE_DATASETS: SampleItem[] = [
  // -------------------------------------------------------------------
  // 1. Core JSON & Visualization
  // -------------------------------------------------------------------
  {
    id: 'users',
    name: 'User Profiles & Roles',
    description: 'Nested array of user profiles with preferences, skills, and spatial coordinates',
    format: 'json',
    category: 'Core JSON',
    content: JSON.stringify(
      [
        {
          id: 'usr_101',
          name: 'Sarah Connor',
          email: 'sarah.c@cyberdyne.io',
          role: 'Administrator',
          active: true,
          profile: {
            age: 32,
            location: {
              city: 'Los Angeles',
              country: 'USA',
              coordinates: { lat: 34.0522, lng: -118.2437 }
            },
            skills: ['Security', 'Cloud Architecture', 'DevOps']
          },
          lastLogin: '2026-07-28T09:15:00Z',
          permissions: ['read', 'write', 'deploy', 'admin']
        },
        {
          id: 'usr_102',
          name: 'Alex Mercer',
          email: 'alex.m@gentek.com',
          role: 'Developer',
          active: true,
          profile: {
            age: 28,
            location: {
              city: 'New York',
              country: 'USA',
              coordinates: { lat: 40.7128, lng: -74.006 }
            },
            skills: ['TypeScript', 'React', 'Node.js']
          },
          lastLogin: '2026-07-27T16:42:10Z',
          permissions: ['read', 'write']
        },
        {
          id: 'usr_103',
          name: 'Elena Rostova',
          email: 'elena.r@techsoft.de',
          role: 'Product Owner',
          active: false,
          profile: {
            age: 35,
            location: {
              city: 'Berlin',
              country: 'Germany',
              coordinates: { lat: 52.52, lng: 13.405 }
            },
            skills: ['Product Management', 'Agile', 'UX Research']
          },
          lastLogin: '2026-07-20T11:05:30Z',
          permissions: ['read']
        }
      ],
      null,
      2
    )
  },
  {
    id: 'e-commerce',
    name: 'E-Commerce Order Catalog',
    description: 'Complex order payload with line items, tax breakdown, and shipping details',
    format: 'json',
    category: 'Core JSON',
    content: JSON.stringify(
      {
        orderId: 'ORD-98421',
        createdDate: '2026-07-28T06:30:00Z',
        currency: 'USD',
        status: 'PROCESSING',
        customer: {
          id: 'cust_7721',
          name: 'David Miller',
          phone: '+1 (555) 234-5678',
          shippingAddress: {
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            zipCode: '97477'
          }
        },
        items: [
          {
            sku: 'AUDIO-HEADPHONES-01',
            title: 'Wireless Noise Cancelling Headphones',
            unitPrice: 249.99,
            quantity: 1,
            taxable: true,
            attributes: { color: 'Matte Black', warrantyYears: 2 }
          },
          {
            sku: 'CHARGER-GAN-65W',
            title: 'USB-C 65W Fast Charger',
            unitPrice: 39.5,
            quantity: 2,
            taxable: true,
            attributes: { color: 'White', ports: 3 }
          }
        ],
        subtotal: 328.99,
        discount: 15.0,
        shippingFee: 0.0,
        tax: 25.12,
        totalAmount: 339.11,
        paymentMethod: 'Credit Card (**** 4242)'
      },
      null,
      2
    )
  },
  {
    id: 'geojson',
    name: 'GeoJSON Map Features',
    description: 'Geographic coordinate markers for global tech innovation hubs',
    format: 'json',
    category: 'Core JSON',
    content: JSON.stringify(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-122.083857, 37.386052]
            },
            properties: {
              title: 'Silicon Valley Campus',
              category: 'HQ',
              employees: 1200,
              established: 2012
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-0.1276, 51.5074]
            },
            properties: {
              title: 'London Tech Hub',
              category: 'Regional Office',
              employees: 450,
              established: 2017
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [139.6917, 35.6895]
            },
            properties: {
              title: 'Tokyo Engineering Lab',
              category: 'R&D',
              employees: 280,
              established: 2020
            }
          }
        ]
      },
      null,
      2
    )
  },
  {
    id: 'dirty-json',
    name: 'Broken / Dirty JSON (Repair Test)',
    description: 'Contains unquoted keys, single quotes, Python keywords, trailing commas, and comments',
    format: 'json',
    category: 'Core JSON',
    content: `// Sample dirty JSON for testing auto-repair
{
  name: 'Alpha Project',
  version: 2.1,
  enabled: True, // Python boolean keyword
  features: [
    'OAuth2 Login',
    'Dark Theme',
    'Data Export', // Trailing comma
  ],
  settings: {
    timeout: 5000,
    retryOnFailure: False,
    'maxConnections': 100,
  },
  owner: None,
}`
  },

  // -------------------------------------------------------------------
  // 2. Data Conversions
  // -------------------------------------------------------------------
  {
    id: 'sample-csv',
    name: 'Staff Payroll (CSV)',
    description: 'Comma separated values table of staff members for CSV ➔ JSON conversion',
    format: 'csv',
    category: 'Conversions',
    content: `EmployeeID,FirstName,LastName,Department,Salary,HireDate
1001,John,Doe,Engineering,95000,2022-03-15
1002,Jane,Smith,Marketing,82000,2021-06-01
1003,Robert,Johnson,"Product, Design",88000,2023-01-10
1004,Emily,Davis,Finance,91000,2020-11-20`
  },
  {
    id: 'sample-xml',
    name: 'Book Catalog (XML)',
    description: 'Structured XML document containing book catalog records',
    format: 'xml',
    category: 'Conversions',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2020-10-01</publish_date>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2021-12-16</publish_date>
  </book>
</catalog>`
  },
  {
    id: 'sample-toml',
    name: 'Server Configuration (TOML)',
    description: 'TOML file with tables, arrays, and scalar key-value pairs',
    format: 'toml',
    category: 'Conversions',
    content: `# Web Server Configuration
title = "Production Server"
port = 8080
enabled = true

[database]
server = "192.168.1.1"
ports = [8001, 8002, 8003]
connection_max = 5000`
  },
  {
    id: 'sample-yaml',
    name: 'Kubernetes Deployment (YAML)',
    description: 'K8s manifest specification for microservice deployment',
    format: 'yaml',
    category: 'Conversions',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  labels:
    app: api-service
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      containers:
      - name: api-server
        image: registry.example.com/api:v2.4.0
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_MAX_CONN
          value: "50"`
  },
  {
    id: 'sample-properties',
    name: 'App Environment (.env)',
    description: 'Key-value environment variables and Java application properties',
    format: 'properties',
    category: 'Conversions',
    content: `# Application Environment Configuration
APP_NAME=JSON Studio Pro
PORT=3000
DEBUG=true
DB_HOST=localhost
DB_NAME=production_db`
  },
  {
    id: 'sample-urlencoded',
    name: 'URL Query String (Form Encoded)',
    description: 'URL query parameters and form-urlencoded HTTP bodies',
    format: 'urlencoded',
    category: 'Conversions',
    content: `search=json+converter&page=1&limit=25&filters%5Bactive%5D=true&sort=date_desc`
  },
  {
    id: 'sample-markdown',
    name: 'Markdown Table',
    description: 'GitHub-flavored Markdown table for documentation and READMEs',
    format: 'markdown',
    category: 'Conversions',
    content: `| ID | Name | Role | Status |
| --- | --- | --- | --- |
| 1 | Alice Johnson | Lead Engineer | Active |
| 2 | Bob Smith | Product Manager | Active |
| 3 | Carol Danvers | UI Designer | Away |`
  },
  {
    id: 'sample-ndjson',
    name: 'Log Telemetry Stream (NDJSON)',
    description: 'Newline Delimited JSON stream for analytics and log inspection',
    format: 'ndjson',
    category: 'Conversions',
    content: `{"timestamp":"2026-07-28T08:00:00Z","level":"info","event":"user_login","userId":101}
{"timestamp":"2026-07-28T08:01:15Z","level":"warn","event":"rate_limit_warning","userId":101}
{"timestamp":"2026-07-28T08:02:30Z","level":"error","event":"payment_failed","userId":205,"code":"INSUFFICIENT_FUNDS"}`
  },

  // -------------------------------------------------------------------
  // 3. Developer Tools & Query Engines
  // -------------------------------------------------------------------
  {
    id: 'sample-curl',
    name: 'cURL API Request (cURL Studio)',
    description: 'cURL command with bearer authorization headers and JSON payload for code generation',
    format: 'text',
    category: 'Dev Tools',
    content: `curl -X POST "https://api.stripe.com/v1/payment_intents" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 2000, "currency": "usd", "payment_method_types": ["card"], "receipt_email": "customer@example.com"}'`
  },
  {
    id: 'sample-jwt',
    name: 'JWT Authentication Token',
    description: 'Real JSON Web Token for testing JWT header, payload, claims, and expiry decoding',
    format: 'text',
    category: 'Dev Tools',
    content: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4dYVp3_nFk7Vf5S56HjB6W6Y6Y6Y6Y6Y6Y6Y6Y6Y6Y6`
  },
  {
    id: 'sample-sql',
    name: 'SQL Table DDL & INSERTs',
    description: 'CREATE TABLE statement and INSERT INTO rows for SQL Studio parsing',
    format: 'sql',
    category: 'Dev Tools',
    content: `CREATE TABLE IF NOT EXISTS products (
  product_id INT PRIMARY KEY,
  title VARCHAR(255),
  price DECIMAL(10, 2),
  in_stock BOOLEAN
);

INSERT INTO products (product_id, title, price, in_stock) VALUES
(101, 'Mechanical Keyboard', 129.99, TRUE),
(102, 'Ergonomic Mouse', 59.50, TRUE),
(103, 'UltraWide Monitor', 499.00, FALSE);`
  },
  {
    id: 'sample-jq',
    name: 'JQ Query Expression Dataset',
    description: 'Array dataset for testing JQ queries like `.items[] | select(.price > 50)`',
    format: 'json',
    category: 'Dev Tools',
    content: JSON.stringify(
      {
        store: 'Tech Central',
        items: [
          { name: 'Laptop Stand', price: 29.99, category: 'accessories', rating: 4.8 },
          { name: 'Mechanical Keyboard', price: 149.00, category: 'peripherals', rating: 4.9 },
          { name: 'USB Hub', price: 19.50, category: 'accessories', rating: 4.2 },
          { name: '4K Webcam', price: 89.99, category: 'peripherals', rating: 4.6 }
        ]
      },
      null,
      2
    )
  },
  {
    id: 'sample-json-patch',
    name: 'JSON Patch Pair (RFC 6902 / 7386)',
    description: 'Document for testing visual JSON diffs and patch generation',
    format: 'json',
    category: 'Dev Tools',
    content: JSON.stringify(
      {
        title: 'Project Phoenix',
        version: 1.0,
        tags: ['alpha', 'internal'],
        author: { name: 'Alice', email: 'alice@company.com' },
        settings: { debug: true, maxThreads: 4 }
      },
      null,
      2
    )
  },

  // -------------------------------------------------------------------
  // 4. AI / LLM & Analytics Studios
  // -------------------------------------------------------------------
  {
    id: 'sample-charts',
    name: 'Visual Analytics & Charts',
    description: 'Monthly business revenue, expenses, and active users dataset for Chart Studio',
    format: 'json',
    category: 'AI & Analytics',
    content: JSON.stringify(
      [
        { month: 'Jan', revenue: 45000, expenses: 32000, activeUsers: 1200 },
        { month: 'Feb', revenue: 52000, expenses: 34000, activeUsers: 1450 },
        { month: 'Mar', revenue: 61000, expenses: 38000, activeUsers: 1800 },
        { month: 'Apr', revenue: 58000, expenses: 36000, activeUsers: 1750 },
        { month: 'May', revenue: 73000, expenses: 41000, activeUsers: 2200 },
        { month: 'Jun', revenue: 84000, expenses: 45000, activeUsers: 2700 }
      ],
      null,
      2
    )
  },
  {
    id: 'sample-llm-tool',
    name: 'AI Tool & Function Spec Source',
    description: 'Sample function parameters for generating OpenAI/Gemini/Zod tool declarations',
    format: 'json',
    category: 'AI & Analytics',
    content: JSON.stringify(
      {
        location: 'San Francisco, CA',
        unit: 'celsius',
        includeForecast: true,
        days: 5,
        metrics: ['temperature', 'humidity', 'wind_speed', 'uv_index']
      },
      null,
      2
    )
  },
  {
    id: 'sample-pii-profiler',
    name: 'PII Redaction & Security Payload',
    description: 'Contains sensitive user data (SSN, credit card, passwords) for testing PII masking & profiler',
    format: 'json',
    category: 'AI & Analytics',
    content: JSON.stringify(
      {
        user_id: 88412,
        username: 'johndoe',
        email: 'john.doe@securenet.org',
        password_hash: '$2b$12$eW5z0xH.e5x7...',
        api_key: 'api_key_sample_demo_12345',
        ssn: '000-12-3456',
        credit_card: '4532-1100-8821-4432',
        billing: {
          cvv: '921',
          zip: '90210',
          amount: 149.99
        }
      },
      null,
      2
    )
  },
  {
    id: 'sample-openapi',
    name: 'REST API Payload (OpenAPI Spec Source)',
    description: 'Complete API payload for generating OpenAPI 3.0 / Swagger schema specifications',
    format: 'json',
    category: 'AI & Analytics',
    content: JSON.stringify(
      {
        status: 'success',
        code: 200,
        data: {
          articleId: 'art_4091',
          title: 'Architecting Scalable Microservices with React and TypeScript',
          views: 14200,
          likes: 852,
          publishedAt: '2026-07-28T12:00:00Z',
          tags: ['architecture', 'typescript', 'web-dev']
        }
      },
      null,
      2
    )
  }
];
