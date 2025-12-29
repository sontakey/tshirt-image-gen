#!/bin/bash

# T-Shirt Image Generation API Test Script

BASE_URL="http://localhost:3001"

echo "=========================================="
echo "T-Shirt Image Generation API Test"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "GET $BASE_URL/health"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: Root Endpoint (API Documentation)
echo "Test 2: API Documentation"
echo "GET $BASE_URL/"
curl -s "$BASE_URL/" | python3 -m json.tool
echo ""
echo ""

# Test 3: Generate Image (will fail without valid API key)
echo "Test 3: Generate Image"
echo "POST $BASE_URL/api/generate"
curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating in space",
    "width": 512,
    "height": 512
  }' | python3 -m json.tool
echo ""
echo ""

# Test 4: Generate Transparent Image (will fail without valid API key)
echo "Test 4: Generate Transparent Image"
echo "POST $BASE_URL/api/generate-transparent"
curl -s -X POST "$BASE_URL/api/generate-transparent" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cool dragon logo",
    "width": 512,
    "height": 512
  }' | python3 -m json.tool
echo ""
echo ""

# Test 5: Error handling - Missing prompt
echo "Test 5: Error Handling (Missing Prompt)"
echo "POST $BASE_URL/api/generate"
curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool
echo ""
echo ""

echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Note: Image generation tests will fail without a valid"
echo "BUILT_IN_FORGE_API_KEY in the .env file."
echo ""
