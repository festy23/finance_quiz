/* tickets.js — «fast review»: 15 экзаменационных билетов АиСД в едином формате.
   Каждый билет = массив блоков { label?, body | pre }:
     - body — текст с лёгкой разметкой: **жирный**, *курсив*, `моноширинный` (формулы — Unicode);
     - pre  — преформатированный моноширинный блок (ASCII-схемы, таблицы).
   Конспект синхронизирован с PDF-шпаргалкой docs/exam/aisd/. */
import { GRAPH_TICKETS } from './tickets/graph.js'
import { STR_TICKETS } from './tickets/str.js'
import { PARA_TICKETS } from './tickets/para.js'

// Цвет рубрик по подписи задаётся на фронте (src/screens/Tickets.jsx) — сюда не тащим (dev-proxy /api).
export const TICKETS = [...GRAPH_TICKETS, ...STR_TICKETS, ...PARA_TICKETS]
