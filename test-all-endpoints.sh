#!/bin/bash

# Comprehensive API Testing Script for EasyShop
# Tests all backend endpoints to ensure they're working

BASE_URL="http://localhost:5001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 EasyShop API Comprehensive Testing"
echo "=========================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $(echo $body | head -c 100)"
        return 1
    fi
}

# Counter for results
PASSED=0
FAILED=0

echo "📦 HOME & PRODUCTS ENDPOINTS"
echo "----------------------------------------"

test_endpoint "GET" "/api/home/get-products" "Get all products" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/api/home/get-categorys" "Get all categories" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/api/home/price-range-latest-product" "Get price range" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/api/home/query-products?category=&searchValue=&lowPrice=0&highPrice=100000&pageNumber=1&parPage=12" "Query products" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/api/home/get-top-category-products" "Get top category products" && ((PASSED++)) || ((FAILED++))

echo ""
echo "🎨 BANNERS & UI ENDPOINTS"
echo "----------------------------------------"

test_endpoint "GET" "/api/banners" "Get banners" && ((PASSED++)) || ((FAILED++))

echo ""
echo "🤖 CHATBOT ENDPOINTS"
echo "----------------------------------------"

test_endpoint "GET" "/api/chatbot/status" "Chatbot status" && ((PASSED++)) || ((FAILED++))
test_endpoint "POST" "/api/chatbot/message" "Send chatbot message" '{"message":"Hello","conversationHistory":[]}' && ((PASSED++)) || ((FAILED++))

echo ""
echo "🔐 AUTH ENDPOINTS (Public)"
echo "----------------------------------------"

test_endpoint "GET" "/api/chat/customer/get-available-sellers" "Get available sellers" && ((PASSED++)) || ((FAILED++))

echo ""
echo "📊 DASHBOARD ENDPOINTS (May require auth)"
echo "----------------------------------------"

test_endpoint "GET" "/api/dashboard/get-dashboard-data" "Get dashboard data" && ((PASSED++)) || ((FAILED++))

echo ""
echo "=========================================="
echo "📊 TEST RESULTS"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi

