// Initial problem set for CodeConnect collaborative problem-solving
// Mix of Easy (4), Medium (4), Hard (2) difficulties

const problems = [
    {
        problemId: 'two-sum',
        title: 'Two Sum',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: 'Easy',
        category: 'Array',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]',
                explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
            }
        ],
        testCases: [
            { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', hidden: false },
            { input: '[3,2,4]\n6', expectedOutput: '[1,2]', hidden: false },
            { input: '[3,3]\n6', expectedOutput: '[0,1]', hidden: false },
            { input: '[1,5,3,7,9]\n12', expectedOutput: '[2,3]', hidden: true },
            { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]', hidden: true }
        ],
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.'
        ],
        boilerplateCode: {
            javascript: `function twoSum(nums, target) {
  // Your code here
  
}`,
            python: `def twoSum(nums, target):
    # Your code here
    pass`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};`
        },
        hints: [
            'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
            'Use a hash map to store the numbers you\'ve seen so far.',
            'For each number, check if its complement (target - number) exists in the hash map.'
        ]
    },

    {
        problemId: 'valid-parentheses',
        title: 'Valid Parentheses',
        description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        difficulty: 'Easy',
        category: 'Stack',
        examples: [
            {
                input: 's = "()"',
                output: 'true',
                explanation: 'The string contains valid parentheses.'
            },
            {
                input: 's = "()[]{}"',
                output: 'true',
                explanation: 'All brackets are properly closed.'
            },
            {
                input: 's = "(]"',
                output: 'false',
                explanation: 'Brackets are not closed in the correct order.'
            }
        ],
        testCases: [
            { input: '()', expectedOutput: 'true', hidden: false },
            { input: '()[]{}', expectedOutput: 'true', hidden: false },
            { input: '(]', expectedOutput: 'false', hidden: false },
            { input: '{[()]}', expectedOutput: 'true', hidden: true },
            { input: '((', expectedOutput: 'false', hidden: true }
        ],
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of parentheses only \'()[]{}\'.'
        ],
        boilerplateCode: {
            javascript: `function isValid(s) {
  // Your code here
  
}`,
            python: `def isValid(s):
    # Your code here
    pass`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    bool isValid(string s) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use a stack data structure.',
            'When you encounter an opening bracket, push it to the stack.',
            'When you encounter a closing bracket, check if it matches the top of the stack.'
        ]
    },

    {
        problemId: 'merge-sorted-arrays',
        title: 'Merge Two Sorted Arrays',
        description: `You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums1\` and \`nums2\` into a single array sorted in non-decreasing order.

The final sorted array should be returned by the function.`,
        difficulty: 'Easy',
        category: 'Array',
        examples: [
            {
                input: 'nums1 = [1,2,3], nums2 = [2,5,6]',
                output: '[1,2,2,3,5,6]',
                explanation: 'The arrays we are merging are [1,2,3] and [2,5,6].'
            },
            {
                input: 'nums1 = [1], nums2 = []',
                output: '[1]',
                explanation: 'The arrays we are merging are [1] and [].'
            }
        ],
        testCases: [
            { input: '[1,2,3]\n[2,5,6]', expectedOutput: '[1,2,2,3,5,6]', hidden: false },
            { input: '[1]\n[]', expectedOutput: '[1]', hidden: false },
            { input: '[]\n[1]', expectedOutput: '[1]', hidden: false },
            { input: '[4,5,6]\n[1,2,3]', expectedOutput: '[1,2,3,4,5,6]', hidden: true }
        ],
        constraints: [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m, n <= 200',
            '-10^9 <= nums1[i], nums2[i] <= 10^9'
        ],
        boilerplateCode: {
            javascript: `function merge(nums1, nums2) {
  // Your code here
  
}`,
            python: `def merge(nums1, nums2):
    # Your code here
    pass`,
            java: `class Solution {
    public int[] merge(int[] nums1, int[] nums2) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> merge(vector<int>& nums1, vector<int>& nums2) {
        // Your code here
        
    }
};`
        },
        hints: [
            'You can use two pointers to iterate through both arrays.',
            'Compare elements at both pointers and add the smaller one to the result.',
            'Don\'t forget to handle remaining elements after one array is exhausted.'
        ]
    },

    {
        problemId: 'reverse-linked-list',
        title: 'Reverse Linked List',
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        difficulty: 'Easy',
        category: 'Linked List',
        examples: [
            {
                input: 'head = [1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: 'The linked list is reversed.'
            },
            {
                input: 'head = [1,2]',
                output: '[2,1]',
                explanation: 'The linked list is reversed.'
            }
        ],
        testCases: [
            { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', hidden: false },
            { input: '[1,2]', expectedOutput: '[2,1]', hidden: false },
            { input: '[]', expectedOutput: '[]', hidden: false },
            { input: '[1]', expectedOutput: '[1]', hidden: true }
        ],
        constraints: [
            'The number of nodes in the list is the range [0, 5000].',
            '-5000 <= Node.val <= 5000'
        ],
        boilerplateCode: {
            javascript: `function reverseList(head) {
  // Your code here
  
}`,
            python: `def reverseList(head):
    # Your code here
    pass`,
            java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Think about using three pointers: previous, current, and next.',
            'Iterate through the list and reverse the links one by one.',
            'You can also solve this recursively.'
        ]
    },

    {
        problemId: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
        difficulty: 'Medium',
        category: 'String',
        examples: [
            {
                input: 's = "abcabcbb"',
                output: '3',
                explanation: 'The answer is "abc", with the length of 3.'
            },
            {
                input: 's = "bbbbb"',
                output: '1',
                explanation: 'The answer is "b", with the length of 1.'
            },
            {
                input: 's = "pwwkew"',
                output: '3',
                explanation: 'The answer is "wke", with the length of 3.'
            }
        ],
        testCases: [
            { input: 'abcabcbb', expectedOutput: '3', hidden: false },
            { input: 'bbbbb', expectedOutput: '1', hidden: false },
            { input: 'pwwkew', expectedOutput: '3', hidden: false },
            { input: 'dvdf', expectedOutput: '3', hidden: true },
            { input: '', expectedOutput: '0', hidden: true }
        ],
        constraints: [
            '0 <= s.length <= 5 * 10^4',
            's consists of English letters, digits, symbols and spaces.'
        ],
        boilerplateCode: {
            javascript: `function lengthOfLongestSubstring(s) {
  // Your code here
  
}`,
            python: `def lengthOfLongestSubstring(s):
    # Your code here
    pass`,
            java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use the sliding window technique.',
            'Keep track of characters you\'ve seen using a hash map or set.',
            'When you find a duplicate, move the left pointer of your window.'
        ]
    },

    {
        problemId: 'three-sum',
        title: '3Sum',
        description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
        difficulty: 'Medium',
        category: 'Array',
        examples: [
            {
                input: 'nums = [-1,0,1,2,-1,-4]',
                output: '[[-1,-1,2],[-1,0,1]]',
                explanation: 'The distinct triplets are [-1,0,1] and [-1,-1,2].'
            },
            {
                input: 'nums = [0,1,1]',
                output: '[]',
                explanation: 'The only possible triplet does not sum up to 0.'
            }
        ],
        testCases: [
            { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', hidden: false },
            { input: '[0,1,1]', expectedOutput: '[]', hidden: false },
            { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', hidden: false },
            { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', hidden: true }
        ],
        constraints: [
            '3 <= nums.length <= 3000',
            '-10^5 <= nums[i] <= 10^5'
        ],
        boilerplateCode: {
            javascript: `function threeSum(nums) {
  // Your code here
  
}`,
            python: `def threeSum(nums):
    # Your code here
    pass`,
            java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Sort the array first to make it easier to avoid duplicates.',
            'Use a two-pointer approach for each element.',
            'Skip duplicate elements to avoid duplicate triplets in the result.'
        ]
    },

    {
        problemId: 'container-most-water',
        title: 'Container With Most Water',
        description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
        difficulty: 'Medium',
        category: 'Array',
        examples: [
            {
                input: 'height = [1,8,6,2,5,4,8,3,7]',
                output: '49',
                explanation: 'The vertical lines are at indices 1 and 8, with heights 8 and 7. The area is min(8,7) * (8-1) = 49.'
            },
            {
                input: 'height = [1,1]',
                output: '1',
                explanation: 'The area is min(1,1) * (1-0) = 1.'
            }
        ],
        testCases: [
            { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', hidden: false },
            { input: '[1,1]', expectedOutput: '1', hidden: false },
            { input: '[4,3,2,1,4]', expectedOutput: '16', hidden: true },
            { input: '[1,2,1]', expectedOutput: '2', hidden: true }
        ],
        constraints: [
            'n == height.length',
            '2 <= n <= 10^5',
            '0 <= height[i] <= 10^4'
        ],
        boilerplateCode: {
            javascript: `function maxArea(height) {
  // Your code here
  
}`,
            python: `def maxArea(height):
    # Your code here
    pass`,
            java: `class Solution {
    public int maxArea(int[] height) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use two pointers starting from both ends of the array.',
            'Calculate the area and move the pointer pointing to the shorter line.',
            'Keep track of the maximum area found.'
        ]
    },

    {
        problemId: 'coin-change',
        title: 'Coin Change',
        description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        examples: [
            {
                input: 'coins = [1,2,5], amount = 11',
                output: '3',
                explanation: '11 = 5 + 5 + 1'
            },
            {
                input: 'coins = [2], amount = 3',
                output: '-1',
                explanation: 'The amount cannot be made up with the given coins.'
            }
        ],
        testCases: [
            { input: '[1,2,5]\n11', expectedOutput: '3', hidden: false },
            { input: '[2]\n3', expectedOutput: '-1', hidden: false },
            { input: '[1]\n0', expectedOutput: '0', hidden: false },
            { input: '[1,3,4,5]\n7', expectedOutput: '2', hidden: true }
        ],
        constraints: [
            '1 <= coins.length <= 12',
            '1 <= coins[i] <= 2^31 - 1',
            '0 <= amount <= 10^4'
        ],
        boilerplateCode: {
            javascript: `function coinChange(coins, amount) {
  // Your code here
  
}`,
            python: `def coinChange(coins, amount):
    # Your code here
    pass`,
            java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Think about using dynamic programming.',
            'Create a DP array where dp[i] represents the minimum coins needed for amount i.',
            'For each amount, try using each coin and take the minimum.'
        ]
    },

    {
        problemId: 'word-ladder',
        title: 'Word Ladder',
        description: `A transformation sequence from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words \`beginWord -> s1 -> s2 -> ... -> sk\` such that:
- Every adjacent pair of words differs by a single letter.
- Every \`si\` for \`1 <= i <= k\` is in \`wordList\`. Note that \`beginWord\` does not need to be in \`wordList\`.
- \`sk == endWord\`

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the number of words in the shortest transformation sequence from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.`,
        difficulty: 'Hard',
        category: 'Graph',
        examples: [
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
                output: '5',
                explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
            },
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
                output: '0',
                explanation: 'The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.'
            }
        ],
        testCases: [
            { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', hidden: false },
            { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: '0', hidden: false },
            { input: 'a\nc\n["a","b","c"]', expectedOutput: '2', hidden: true }
        ],
        constraints: [
            '1 <= beginWord.length <= 10',
            'endWord.length == beginWord.length',
            '1 <= wordList.length <= 5000',
            'wordList[i].length == beginWord.length',
            'beginWord, endWord, and wordList[i] consist of lowercase English letters.',
            'beginWord != endWord',
            'All the words in wordList are unique.'
        ],
        boilerplateCode: {
            javascript: `function ladderLength(beginWord, endWord, wordList) {
  // Your code here
  
}`,
            python: `def ladderLength(beginWord, endWord, wordList):
    # Your code here
    pass`,
            java: `class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use BFS (Breadth-First Search) to find the shortest path.',
            'Build a graph where each word is connected to words that differ by one letter.',
            'Use a queue to explore all possible transformations level by level.'
        ]
    },

    {
        problemId: 'median-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
        difficulty: 'Hard',
        category: 'Binary Search',
        examples: [
            {
                input: 'nums1 = [1,3], nums2 = [2]',
                output: '2.00000',
                explanation: 'merged array = [1,2,3] and median is 2.'
            },
            {
                input: 'nums1 = [1,2], nums2 = [3,4]',
                output: '2.50000',
                explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
            }
        ],
        testCases: [
            { input: '[1,3]\n[2]', expectedOutput: '2.0', hidden: false },
            { input: '[1,2]\n[3,4]', expectedOutput: '2.5', hidden: false },
            { input: '[]\n[1]', expectedOutput: '1.0', hidden: true },
            { input: '[2]\n[]', expectedOutput: '2.0', hidden: true }
        ],
        constraints: [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m <= 1000',
            '0 <= n <= 1000',
            '1 <= m + n <= 2000',
            '-10^6 <= nums1[i], nums2[i] <= 10^6'
        ],
        boilerplateCode: {
            javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Your code here
  
}`,
            python: `def findMedianSortedArrays(nums1, nums2):
    # Your code here
    pass`,
            java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your code here
        
    }
}`,
            cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // Your code here
        
    }
};`
        },
        hints: [
            'Use binary search on the smaller array.',
            'Partition both arrays such that elements on the left are smaller than elements on the right.',
            'The median will be at the partition point.'
        ]
    }
];

module.exports = problems;
