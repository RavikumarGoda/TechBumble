export const dsaEasy = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. Each input has exactly one solution, and you may not use the same element twice.",
    explanation: "Use a hash map to store each number and its index as we iterate. For each element, check if its complement (target - current) exists in the map. This gives O(n) time vs O(n²) for brute force. Edge case: ensure the two indices are different. The map lookup is O(1) average.",
    solution: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> mp;
    for(int i=0;i<nums.size();i++){
        int comp=target-nums[i];
        if(mp.count(comp)) return {mp[comp],i};
        mp[nums[i]]=i;
    }
    return {};
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just '(', ')', '{', '}', '[', ']', determine if the input string is valid. A string is valid if brackets close in the correct order.",
    explanation: "Use a stack to track opening brackets. When we see a closing bracket, check if it matches the top of the stack. If the stack is empty at the end, the string is valid. Time O(n), Space O(n). Common mistake: forgetting to check if the stack is empty before popping.",
    solution: `bool isValid(string s) {
    stack<char> st;
    for(char c:s){
        if(c=='('||c=='['||c=='{') st.push(c);
        else {
            if(st.empty()) return false;
            if(c==')'&&st.top()!='(') return false;
            if(c==']'&&st.top()!='[') return false;
            if(c=='}'&&st.top()!='{') return false;
            st.pop();
        }
    }
    return st.empty();
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "Given an array prices where prices[i] is the price of a stock on day i, find the maximum profit from one buy-sell transaction. You must buy before you sell.",
    explanation: "Track the minimum price seen so far and the maximum profit at each step. For each day, the best profit is current price minus the minimum seen so far. Update min price and max profit greedily. O(n) time, O(1) space. No need for two passes.",
    solution: `int maxProfit(vector<int>& prices) {
    int minP=INT_MAX, maxP=0;
    for(int p:prices){
        minP=min(minP,p);
        maxP=max(maxP,p-minP);
    }
    return maxP;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if it reads the same forward and backward after converting all uppercase letters to lowercase and removing all non-alphanumeric characters. Return true if the string is a palindrome.",
    explanation: "Use two pointers from both ends, skipping non-alphanumeric characters. Compare lowercase versions of valid characters. If all comparisons pass, it's a palindrome. O(n) time, O(1) space. Using isalnum() and tolower() from C standard library handles edge cases cleanly.",
    solution: `bool isPalindrome(string s) {
    int l=0,r=s.size()-1;
    while(l<r){
        while(l<r&&!isalnum(s[l])) l++;
        while(l<r&&!isalnum(s[r])) r--;
        if(tolower(s[l])!=tolower(s[r])) return false;
        l++;r--;
    }
    return true;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Single Number",
    description: "Given a non-empty array of integers where every element appears twice except one, find the single element that appears only once. Must run in O(n) time and O(1) space.",
    explanation: "XOR of a number with itself is 0, and XOR with 0 is the number itself. XOR all elements together — pairs cancel out leaving the unique number. This is a classic bit manipulation trick. O(n) time, O(1) space, no extra data structures needed.",
    solution: `int singleNumber(vector<int>& nums) {
    int res=0;
    for(int n:nums) res^=n;
    return res;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Contains Duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice, and false if every element is distinct.",
    explanation: "Insert each element into a hash set. Before inserting, check if it already exists. If yes, return true immediately. This is O(n) time and O(n) space. Alternative O(n log n) approach: sort and check adjacent elements, but hash set is faster.",
    solution: `bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> s;
    for(int n:nums){
        if(s.count(n)) return true;
        s.insert(n);
    }
    return false;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Missing Number",
    description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    explanation: "Expected sum of 0..n is n*(n+1)/2. Subtract actual sum to get missing number. Alternatively use XOR: XOR all indices 0..n and all values; duplicates cancel. Both are O(n) time, O(1) space. The math approach is simplest and most intuitive.",
    solution: `int missingNumber(vector<int>& nums) {
    int n=nums.size(), sum=n*(n+1)/2;
    for(int x:nums) sum-=x;
    return sum;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list and return the reversed list.",
    explanation: "Iteratively keep track of prev, curr, and next pointers. At each step, reverse the current node's next pointer to point to prev, then advance all three pointers. After the loop, prev is the new head. O(n) time, O(1) space. Recursive solution is O(n) space due to call stack.",
    solution: `ListNode* reverseList(ListNode* head) {
    ListNode *prev=nullptr, *curr=head;
    while(curr){
        ListNode* nxt=curr->next;
        curr->next=prev;
        prev=curr;
        curr=nxt;
    }
    return prev;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    explanation: "This is Fibonacci sequence! Ways to reach step n = ways to reach step n-1 (take 1 step) + ways to reach n-2 (take 2 steps). Base cases: dp[1]=1, dp[2]=2. Use two variables instead of full array for O(1) space. Recognizing the Fibonacci pattern is the key insight.",
    solution: `int climbStairs(int n) {
    if(n<=2) return n;
    int a=1,b=2;
    for(int i=3;i<=n;i++){
        int c=a+b; a=b; b=c;
    }
    return b;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Maximum Subarray (Kadane's Algorithm)",
    description: "Given an integer array nums, find the subarray with the largest sum and return its sum. The subarray must contain at least one element.",
    explanation: "Kadane's algorithm: maintain current sum and max sum. At each element, either extend the current subarray or start fresh (whichever is larger). If current sum goes negative, reset to 0. O(n) time, O(1) space. This greedy approach works because a negative prefix can never help.",
    solution: `int maxSubArray(vector<int>& nums) {
    int cur=nums[0], best=nums[0];
    for(int i=1;i<nums.size();i++){
        cur=max(nums[i],cur+nums[i]);
        best=max(best,cur);
    }
    return best;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Invert Binary Tree",
    description: "Given the root of a binary tree, invert the tree (mirror it) and return its root.",
    explanation: "Recursively swap left and right children for every node. Base case: if node is null, return null. The recursive call propagates down to all nodes. O(n) time since we visit each node once, O(h) space for the recursion stack where h is the height of the tree.",
    solution: `TreeNode* invertTree(TreeNode* root) {
    if(!root) return nullptr;
    swap(root->left,root->right);
    invertTree(root->left);
    invertTree(root->right);
    return root;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Move Zeroes",
    description: "Given an integer array nums, move all 0s to the end while maintaining the relative order of non-zero elements. Do this in-place without making a copy.",
    explanation: "Use a write pointer that tracks where the next non-zero should go. Scan the array; when we find a non-zero element, write it to the write pointer position and advance. After the scan, fill the rest with zeros. O(n) time, O(1) space, two passes total.",
    solution: `void moveZeroes(vector<int>& nums) {
    int pos=0;
    for(int n:nums) if(n!=0) nums[pos++]=n;
    while(pos<nums.size()) nums[pos++]=0;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists. Merge the two lists into one sorted list and return the head of the merged list.",
    explanation: "Use a dummy head node to simplify edge cases. Compare current nodes of both lists, attach the smaller one to the result, and advance that pointer. When one list is exhausted, attach the rest of the other. O(m+n) time, O(1) space (iterative). The dummy node avoids special-casing the head.",
    solution: `ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy(0); ListNode* cur=&dummy;
    while(l1&&l2){
        if(l1->val<=l2->val){cur->next=l1;l1=l1->next;}
        else{cur->next=l2;l2=l2->next;}
        cur=cur->next;
    }
    cur->next=l1?l1:l2;
    return dummy.next;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    description: "Suppose an array of unique elements is sorted and then rotated at some pivot. Given the rotated array, find the minimum element. Must run in O(log n) time.",
    explanation: "Binary search: if mid element is greater than rightmost element, the minimum is in the right half. Otherwise it's in the left half (including mid). Narrow the search range until lo==hi, which is the minimum. O(log n) time. The comparison with nums[r] not nums[0] handles non-rotated arrays correctly.",
    solution: `int findMin(vector<int>& nums) {
    int l=0,r=nums.size()-1;
    while(l<r){
        int m=l+(r-l)/2;
        if(nums[m]>nums[r]) l=m+1;
        else r=m;
    }
    return nums[l];
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
  {
    title: "First Bad Version",
    description: "You are a product manager with n versions of a product. You want to find the first bad version that causes all following versions to be bad. Minimize API calls to isBadVersion(). ",
    explanation: "Classic binary search for the leftmost condition. If mid is bad, the first bad version is at mid or earlier, so move right boundary to mid. If mid is good, move left boundary to mid+1. When lo==hi, we have the first bad version. O(log n) time, O(1) space.",
    solution: `int firstBadVersion(int n) {
    int l=1,r=n;
    while(l<r){
        int m=l+(r-l)/2;
        if(isBadVersion(m)) r=m;
        else l=m+1;
    }
    return l;
}`,
    category: "DSA", difficulty: "Easy", companies: []
  },
];
