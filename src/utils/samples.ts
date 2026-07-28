export interface SampleItem {
  id: string;
  name: string;
  description: string;
  format: string;
  content: string;
}

export const SAMPLE_DATASETS: SampleItem[] = [
  {
    id: 'users',
    name: 'User Profiles & Roles',
    description: 'Nested array of user profiles with preferences and contact info',
    format: 'json',
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
    description: 'Order details with line items, pricing, and shipping status',
    format: 'json',
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
    description: 'Geographic coordinate markers for global tech hubs',
    format: 'json',
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
    description: 'Contains unquoted keys, trailing commas, single quotes, and comments for testing auto-repair',
    format: 'json',
    content: `// Sample dirty JSON for testing auto-repair
{
  name: 'Alpha Project',
  version: 2.1,
  enabled: True, // Python boolean
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
}`
  },
  {
    id: 'sample-csv',
    name: 'Employees Table (CSV)',
    description: 'Comma separated values table of staff members',
    format: 'csv',
    content: `EmployeeID,FirstName,LastName,Department,Salary,HireDate
1001,John,Doe,Engineering,95000,2022-03-15
1002,Jane,Smith,Marketing,82000,2021-06-01
1003,Robert,Johnson,"Product, Design",88000,2023-01-10
1004,Emily,Davis,Finance,91000,2020-11-20`
  },
  {
    id: 'sample-xml',
    name: 'Book Catalog (XML)',
    description: 'XML document containing book catalog records',
    format: 'xml',
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
    name: 'Server Config (TOML)',
    description: 'TOML configuration file for web application server',
    format: 'toml',
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
    id: 'sample-properties',
    name: 'App Environment (.env)',
    description: 'Key-value environment variables / Java properties',
    format: 'properties',
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
    description: 'URL-encoded form payload / query parameters',
    format: 'urlencoded',
    content: `search=json+converter&page=1&limit=25&filters%5Bactive%5D=true&sort=date_desc`
  },
  {
    id: 'sample-markdown',
    name: 'Markdown Table',
    description: 'Markdown formatted table for docs and GitHub READMEs',
    format: 'markdown',
    content: `| ID | Name | Role | Status |
| --- | --- | --- | --- |
| 1 | Alice Johnson | Lead Engineer | Active |
| 2 | Bob Smith | Product Manager | Active |
| 3 | Carol Danvers | UI Designer | Away |`
  },
  {
    id: 'sample-ndjson',
    name: 'Log Stream (NDJSON)',
    description: 'Newline Delimited JSON stream for big data & telemetry',
    format: 'ndjson',
    content: `{"timestamp":"2026-07-28T08:00:00Z","level":"info","event":"user_login","userId":101}
{"timestamp":"2026-07-28T08:01:15Z","level":"warn","event":"rate_limit_warning","userId":101}
{"timestamp":"2026-07-28T08:02:30Z","level":"error","event":"payment_failed","userId":205,"code":"INSUFFICIENT_FUNDS"}`
  }
];
