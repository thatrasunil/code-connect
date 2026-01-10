import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codeconnect_backend.settings')
django.setup()

from core.models import Question

questions_data = [
    # Arrays and strings (Category: Array) - Image: array_string.png
    {"title": "Two Sum Finder", "content": "Given an array and a target, return indices of two numbers whose sum equals the target.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Best Time to Buy Stock", "content": "Given daily stock prices, find the maximum profit from one buy and one sell.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Product of Array Except Self", "content": "Return an array where each element is the product of all other elements without using division.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Maximum Subarray Sum", "content": "Find the contiguous subarray with the largest sum.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Contains Duplicate Checker", "content": "Determine if any value appears at least twice in the array.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Rotate Array In-Place", "content": "Rotate an array to the right by k steps with O(1) extra space.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Move Zeroes to End", "content": "Move all zeroes to the end while maintaining the order of non-zero elements.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Longest Common Prefix", "content": "Given a list of strings, find the longest common prefix.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Valid Anagram", "content": "Check if two strings are anagrams using character counts.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Group Anagrams", "content": "Group a list of strings into anagram groups.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Longest Substring Without Repeating Characters", "content": "Return length of the longest substring without repeating characters using sliding window.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "String Compression Encoder", "content": "Compress repeated characters in-place, returning the new length.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Ransom Note Construction", "content": "Determine if ransom note can be constructed from magazine letters.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Reverse Words in a String", "content": "Trim spaces and reverse the order of words in-place.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Palindrome String Check", "content": "Check if a string is a palindrome considering only alphanumeric characters and ignoring case.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Merge Sorted Arrays", "content": "Merge two sorted arrays into one sorted array in-place.", "difficulty": "Easy", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Interval Merge", "content": "Merge overlapping intervals and return consolidated intervals.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Insert Interval", "content": "Insert a new interval into a sorted, non-overlapping interval list and merge as needed.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Spiral Matrix Traversal", "content": "Return all elements of a matrix in spiral order.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},
    {"title": "Set Matrix Zeroes", "content": "If an element is zero, set its entire row and column to zero in-place.", "difficulty": "Medium", "topic": "Arrays and Strings", "image": "/media/questions/array_string.png"},

    # Hashing, stacks, and queues (Category: General/Algo) - Image: general.png
    {"title": "Valid Parentheses", "content": "Check if a string of brackets is valid using a stack.", "difficulty": "Easy", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "Min Stack Design", "content": "Design a stack that supports push, pop, top, and retrieving minimum in O(1).", "difficulty": "Medium", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "Implement Queue Using Stacks", "content": "Use two stacks to implement a FIFO queue.", "difficulty": "Easy", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "Implement Stack Using Queues", "content": "Use one or two queues to implement a LIFO stack.", "difficulty": "Easy", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "Next Greater Element in Array", "content": "For each element, find the next greater element to its right.", "difficulty": "Medium", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "Daily Temperatures Wait Time", "content": "Given temperatures, compute days until a warmer temperature for each day.", "difficulty": "Medium", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "LRU Cache Design", "content": "Design a least recently used cache with get and put in O(1).", "difficulty": "Medium", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "LFU Cache Design", "content": "Design a least frequently used cache with O(1) operations.", "difficulty": "Hard", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "Top K Frequent Elements", "content": "Return the k most frequent numbers in an array.", "difficulty": "Medium", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},
    {"title": "First Unique Character in String", "content": "Return the index of the first non-repeating character.", "difficulty": "Easy", "topic": "Hashing, Stacks, Queues", "image": "/media/questions/general.png"},

    # Linked lists (Category: General/Algo -> Actually lets reuse Tree/Graph or General) -> Using Tree/Graph for node structures
    {"title": "Reverse Singly Linked List", "content": "Reverse a linked list iteratively or recursively.", "difficulty": "Easy", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Detect Cycle in Linked List", "content": "Detect whether a cycle exists using two pointers.", "difficulty": "Easy", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Merge Two Sorted Lists", "content": "Merge two sorted linked lists into one sorted list.", "difficulty": "Easy", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Reorder List", "content": "Reorder list from L0 -> Ln -> L1 -> Ln-1...", "difficulty": "Medium", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Remove Nth Node From End", "content": "Remove the nth node from the end in one pass.", "difficulty": "Medium", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Copy List With Random Pointer", "content": "Deep copy a linked list with random pointers.", "difficulty": "Medium", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Add Two Numbers as Lists", "content": "Sum two numbers represented by linked lists.", "difficulty": "Medium", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Reverse Nodes in k-Group", "content": "Reverse nodes in groups of k in a linked list.", "difficulty": "Hard", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Sort Linked List", "content": "Sort a linked list in O(n log n) time.", "difficulty": "Medium", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},
    {"title": "Intersection of Two Linked Lists", "content": "Return the intersection node of two singly linked lists if it exists.", "difficulty": "Medium", "topic": "Linked Lists", "image": "/media/questions/tree_graph.png"},

    # Trees and graphs (Category: Tree/Graph) - Image: tree_graph.png
    {"title": "Binary Tree Level Order Traversal", "content": "Return level-order traversal of a binary tree.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Validate Binary Search Tree", "content": "Check if a binary tree is a valid BST.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Lowest Common Ancestor in BST", "content": "Find LCA of two nodes in a BST.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Binary Tree Maximum Path Sum", "content": "Return maximum path sum in a binary tree.", "difficulty": "Hard", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Serialize and Deserialize Binary Tree", "content": "Convert binary tree to string and back.", "difficulty": "Hard", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Kth Smallest in BST", "content": "Return the kth smallest value in a BST.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Number of Islands", "content": "Count number of islands in a 2D grid using DFS/BFS.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Rotting Oranges", "content": "Find minimum time to rot all oranges in a grid or return -1.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Course Schedule", "content": "Determine if all courses can be finished given prerequisites (cycle detection).", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},
    {"title": "Clone Graph", "content": "Clone an undirected graph using DFS/BFS.", "difficulty": "Medium", "topic": "Trees and Graphs", "image": "/media/questions/tree_graph.png"},

    # Dynamic programming (Category: DP) - Image: dynamic_programming.png
    {"title": "Climbing Stairs Ways", "content": "Compute number of distinct ways to climb n stairs taking 1 or 2 steps.", "difficulty": "Easy", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "House Robber", "content": "Max money that can be robbed from non-adjacent houses.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Coin Change Minimum Coins", "content": "Return fewest coins needed to make a given amount.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Longest Increasing Subsequence", "content": "Return length of LIS in an array.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Unique Paths in Grid", "content": "Number of unique paths in m x n grid moving only right or down.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Word Break", "content": "Check if a string can be segmented into dictionary words.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Partition Equal Subset Sum", "content": "Check whether array can be partitioned into two subsets of equal sum.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Edit Distance", "content": "Compute minimum operations to convert one string into another.", "difficulty": "Hard", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Maximum Product Subarray", "content": "Return maximum product of a contiguous subarray.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},
    {"title": "Palindromic Substrings Count", "content": "Count all palindromic substrings in a string.", "difficulty": "Medium", "topic": "Dynamic Programming", "image": "/media/questions/dynamic_programming.png"},

    # Searching, sorting, and math (Category: General) - Image: general.png
    {"title": "Binary Search on Sorted Array", "content": "Implement classic binary search returning index or -1.", "difficulty": "Easy", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Search in Rotated Sorted Array", "content": "Find target in rotated sorted array with O(log n) time.", "difficulty": "Medium", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Find Peak Element", "content": "Return index of any peak element in an array.", "difficulty": "Medium", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "K Closest Points to Origin", "content": "Return k points closest to origin using heap.", "difficulty": "Medium", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Merge K Sorted Lists", "content": "Merge k sorted linked lists using heap or divide and conquer.", "difficulty": "Hard", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Median of Two Sorted Arrays", "content": "Find median of two sorted arrays in logarithmic time.", "difficulty": "Hard", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Integer to Roman and Back", "content": "Convert integers to Roman numerals and vice versa.", "difficulty": "Medium", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Pow(x, n)", "content": "Implement power function using fast exponentiation.", "difficulty": "Medium", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Sqrt Using Binary Search", "content": "Compute integer square root of a non-negative integer.", "difficulty": "Easy", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},
    {"title": "Sudoku Solver", "content": "Fill a 9x9 Sudoku board with valid digits using backtracking.", "difficulty": "Hard", "topic": "Searching and Sorting", "image": "/media/questions/general.png"},

    # REST APIs and backend logic (Category: Backend/API) - Image: backend_api.png
    {"title": "Paginated Users API", "content": "Design an endpoint to fetch users with page, limit, and search query parameters.", "difficulty": "Easy", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Rate Limiter Middleware", "content": "Implement per-IP rate limiting middleware for an API.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "JWT Authentication Flow", "content": "Design signup, login, refresh token, and protected route logic.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Role-Based Authorization Guard", "content": "Implement middleware that only allows specific roles to access certain routes.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "File Upload API With Validation", "content": "Create an API that accepts file uploads with size and MIME checks.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Email Verification Token Flow", "content": "Implement email verification using signed tokens and expiry.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Password Reset Flow", "content": "Design endpoints for requesting and completing password reset securely.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Idempotent Payment Webhook", "content": "Implement webhook endpoint that handles duplicate notifications safely.", "difficulty": "Hard", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Bulk Insert With Transactions", "content": "Create an endpoint that inserts a batch of records atomically.", "difficulty": "Medium", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},
    {"title": "Soft Delete vs Hard Delete API", "content": "Implement soft delete and restore endpoints using a deleted flag.", "difficulty": "Easy", "topic": "Backend Logic", "image": "/media/questions/backend_api.png"},

    # Databases and queries (Category: Backend/API) -> Using Backend image for DB too
    {"title": "Search and Filter Posts Query", "content": "Write SQL (or ORM) to fetch posts with keyword search, tags filter, and pagination.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Leaderboard With Ties", "content": "Create a query that ranks users by score with proper tie handling.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Activity Feed Query", "content": "Return latest activity items per user, sorted by time with limit.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "N+1 Query Debugging Task", "content": "Given ORM code, refactor to remove N+1 queries using eager loading.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Unique Constraint Handling", "content": "Implement safe create/update logic for a model with unique email field.", "difficulty": "Easy", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Implement Full-Text Search Endpoint", "content": "Design an endpoint using DB full-text search on title and description fields.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Optimistic Locking on Update", "content": "Implement version field to prevent lost updates in concurrent requests.", "difficulty": "Hard", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Database Index Design Task", "content": "Given query patterns, choose indexes and explain effect on performance.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Multi-Tenant Data Isolation", "content": "Model schema or queries so tenants cannot see each other’s data.", "difficulty": "Hard", "topic": "Databases", "image": "/media/questions/backend_api.png"},
    {"title": "Audit Log Table Design", "content": "Design schema and insert logic for tracking changes on critical tables.", "difficulty": "Medium", "topic": "Databases", "image": "/media/questions/backend_api.png"},

    # Frontend, real-time, and debugging (Category: General/Frontend) - Image: general.png
    {"title": "Infinite Scroll Feed Component", "content": "Implement a frontend list that loads more items as user scrolls.", "difficulty": "Medium", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Debounced Search Input", "content": "Create a search box that calls API with debounce and shows loading state.", "difficulty": "Easy", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Client-Side Form Validation", "content": "Implement reusable validation helpers with async rule support.", "difficulty": "Medium", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "WebSocket Chat Server and Client", "content": "Implement basic real-time chat using WebSocket or Socket.io.", "difficulty": "Hard", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Presence Indicator Logic", "content": "Track online/offline status of users using heartbeats.", "difficulty": "Medium", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Optimistic UI Updates", "content": "Update UI instantly for create/update and rollback on error.", "difficulty": "Medium", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Error Boundary Component", "content": "Create a component that catches render errors and shows fallback UI.", "difficulty": "Easy", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Feature Flag Toggle System", "content": "Implement simple feature flags in backend and use them on frontend.", "difficulty": "Medium", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Performance Profiling Bug Hunt", "content": "Given a slow component, identify and fix unnecessary re-renders.", "difficulty": "Hard", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"},
    {"title": "Logging Correlation IDs", "content": "Design logging so each request has a correlation ID across services.", "difficulty": "Medium", "topic": "Frontend and Debugging", "image": "/media/questions/general.png"}
]

print(f"Starting population of {len(questions_data)} questions...")

count = 0
for q in questions_data:
    obj, created = Question.objects.get_or_create(
        title=q['title'],
        defaults={
            'content': q['content'],
            'difficulty': q['difficulty'],
            'topic': q['topic'],
            'image_url': q['image']
        }
    )
    if created:
        count += 1
        print(f"Created: {q['title']}")
    else:
        # Update if exists to ensure images are set
        obj.image_url = q['image']
        obj.save()
        print(f"Updated: {q['title']}")

print(f"Finished! {count} new questions created.")
