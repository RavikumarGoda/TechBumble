export const dsaMedium = [
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    explanation: "Sliding window with a hash map storing each character's latest index. Expand right pointer always; when a duplicate is found, move left pointer to max(left, last index of duplicate + 1). Track max window size. O(n) time, O(min(n,k)) space where k is charset size.",
    solution: `int lengthOfLongestSubstring(string s) {
    unordered_map<char,int> mp;
    int res=0,l=0;
    for(int r=0;r<s.size();r++){
        if(mp.count(s[r])) l=max(l,mp[s[r]]+1);
        mp[s[r]]=r;
        res=max(res,r-l+1);
    }
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Container With Most Water",
    description: "Given n non-negative integers representing heights of lines, find two lines that together with the x-axis form a container that holds the most water.",
    explanation: "Two pointer approach: start with widest container (left=0, right=n-1). Area = min(height[l],height[r])*(r-l). Move the pointer with the smaller height inward — moving the taller one can only decrease area. This greedy works because width decreases either way, so we must maximize height. O(n) time.",
    solution: `int maxArea(vector<int>& height) {
    int l=0,r=height.size()-1,res=0;
    while(l<r){
        res=max(res,min(height[l],height[r])*(r-l));
        if(height[l]<height[r]) l++;
        else r--;
    }
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "3Sum",
    description: "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i, j, k are distinct and nums[i]+nums[j]+nums[k]=0. The solution must not contain duplicate triplets.",
    explanation: "Sort the array. Fix one element and use two pointers for the remaining pair. Skip duplicate values for the fixed element to avoid duplicate triplets. When sum equals zero, record and skip duplicates for both pointers. O(n²) time, O(log n) space for sorting.",
    solution: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(),nums.end());
    vector<vector<int>> res;
    for(int i=0;i<nums.size()-2;i++){
        if(i>0&&nums[i]==nums[i-1]) continue;
        int l=i+1,r=nums.size()-1;
        while(l<r){
            int s=nums[i]+nums[l]+nums[r];
            if(s==0){res.push_back({nums[i],nums[l],nums[r]});
                while(l<r&&nums[l]==nums[l+1])l++;
                while(l<r&&nums[r]==nums[r-1])r--;
                l++;r--;}
            else if(s<0) l++;
            else r--;
        }
    }
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Number of Islands",
    description: "Given a 2D binary grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
    explanation: "DFS/BFS from each unvisited '1'. Mark all connected cells as visited (change to '0' or use visited array). Each DFS call from a new '1' represents one island. O(m*n) time and space. BFS works equally well. The key is to mark cells visited to avoid recounting.",
    solution: `int numIslands(vector<vector<char>>& grid) {
    int m=grid.size(),n=grid[0].size(),cnt=0;
    function<void(int,int)> dfs=[&](int r,int c){
        if(r<0||r>=m||c<0||c>=n||grid[r][c]!='1') return;
        grid[r][c]='0';
        dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1);
    };
    for(int i=0;i<m;i++) for(int j=0;j<n;j++)
        if(grid[i][j]=='1'){cnt++;dfs(i,j);}
    return cnt;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Coin Change",
    description: "Given an array of coin denominations and an amount, return the fewest number of coins needed to make up that amount. If it cannot be made, return -1.",
    explanation: "Bottom-up DP: dp[i] = minimum coins to make amount i. Initialize dp[0]=0, rest=infinity. For each amount, try every coin denomination. dp[i]=min(dp[i], dp[i-coin]+1) if i>=coin. Final answer is dp[amount], or -1 if still infinity. O(amount*coins) time and O(amount) space.",
    solution: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount+1,INT_MAX);
    dp[0]=0;
    for(int i=1;i<=amount;i++)
        for(int c:coins)
            if(c<=i&&dp[i-c]!=INT_MAX)
                dp[i]=min(dp[i],dp[i-c]+1);
    return dp[amount]==INT_MAX?-1:dp[amount];
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] equals the product of all elements except nums[i]. Must run in O(n) without using division.",
    explanation: "Two-pass approach: First build prefix products (left to right), then multiply by suffix products (right to left) using a running variable. answer[i] = product of all elements left of i * product of all elements right of i. O(n) time, O(1) extra space (output array doesn't count).",
    solution: `vector<int> productExceptSelf(vector<int>& nums) {
    int n=nums.size();
    vector<int> res(n,1);
    for(int i=1;i<n;i++) res[i]=res[i-1]*nums[i-1];
    int right=1;
    for(int i=n-1;i>=0;i--){res[i]*=right;right*=nums[i];}
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Jump Game",
    description: "Given an integer array nums where nums[i] is your maximum jump length at position i, return true if you can reach the last index starting from index 0.",
    explanation: "Greedily track the farthest index reachable. At each position, if it's beyond our current farthest reach, we're stuck. Otherwise, update max reachable. If we process all positions without getting stuck, we can reach the end. O(n) time, O(1) space. The key insight is focusing on max reachability.",
    solution: `bool canJump(vector<int>& nums) {
    int maxR=0;
    for(int i=0;i<nums.size();i++){
        if(i>maxR) return false;
        maxR=max(maxR,i+nums[i]);
    }
    return true;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Merge Intervals",
    description: "Given an array of intervals where intervals[i]=[start, end], merge all overlapping intervals and return an array of non-overlapping intervals.",
    explanation: "Sort intervals by start time. Iterate and merge the current interval with the last interval in result if they overlap (current start <= last end). If no overlap, append current to result. O(n log n) for sorting, O(n) for merging. Sorting first ensures we only need to check adjacent intervals.",
    solution: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(),intervals.end());
    vector<vector<int>> res;
    for(auto& iv:intervals){
        if(res.empty()||res.back()[1]<iv[0]) res.push_back(iv);
        else res.back()[1]=max(res.back()[1],iv[1]);
    }
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "House Robber",
    description: "You are a robber planning to rob houses along a street. You cannot rob two adjacent houses. Given an array of amounts, find the maximum you can rob tonight.",
    explanation: "DP: at each house either rob it (add to dp[i-2]) or skip it (take dp[i-1]). dp[i]=max(dp[i-1], dp[i-2]+nums[i]). Optimize to O(1) space using two variables. The recurrence naturally handles the adjacency constraint. Base cases: dp[0]=nums[0], dp[1]=max(nums[0],nums[1]).",
    solution: `int rob(vector<int>& nums) {
    int prev2=0,prev1=0;
    for(int n:nums){
        int cur=max(prev1,prev2+n);
        prev2=prev1; prev1=cur;
    }
    return prev1;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Search in Rotated Sorted Array",
    description: "Given a rotated sorted array of unique integers and a target, return the index of target or -1. Must run in O(log n) time.",
    explanation: "Modified binary search. At each step, determine which half is sorted by comparing mid with boundaries. If target is within the sorted half, search there; otherwise search the other half. This always eliminates half the search space. O(log n) time. The key is identifying which half is definitely sorted.",
    solution: `int search(vector<int>& nums, int target) {
    int l=0,r=nums.size()-1;
    while(l<=r){
        int m=l+(r-l)/2;
        if(nums[m]==target) return m;
        if(nums[l]<=nums[m]){
            if(nums[l]<=target&&target<nums[m]) r=m-1;
            else l=m+1;
        } else {
            if(nums[m]<target&&target<=nums[r]) l=m+1;
            else r=m-1;
        }
    }
    return -1;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Top K Frequent Elements",
    description: "Given an integer array nums and integer k, return the k most frequent elements. You may return the answer in any order.",
    explanation: "Count frequencies with a hash map. Use a min-heap of size k — push all frequency-element pairs; if heap size exceeds k, pop the minimum. Or use bucket sort: create buckets indexed by frequency (max n), then read from high to low. Bucket sort achieves O(n) time vs O(n log k) for heap.",
    solution: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int,int> cnt;
    for(int n:nums) cnt[n]++;
    vector<vector<int>> bucket(nums.size()+1);
    for(auto& [n,f]:cnt) bucket[f].push_back(n);
    vector<int> res;
    for(int i=bucket.size()-1;i>=0&&res.size()<k;i--)
        for(int n:bucket[i]) res.push_back(n);
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Group Anagrams",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    explanation: "For each string, create a canonical key. The simplest key is the sorted version of the string. Use a hash map from key to list of anagrams. All anagrams of the same word will sort to the same string. O(n*k*log k) time where k is max string length. Alternatively use character frequency array as key for O(n*k).",
    solution: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string,vector<string>> mp;
    for(string& s:strs){
        string key=s; sort(key.begin(),key.end());
        mp[key].push_back(s);
    }
    vector<vector<string>> res;
    for(auto& [k,v]:mp) res.push_back(v);
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Word Break",
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of dictionary words.",
    explanation: "DP: dp[i] = true if s[0..i-1] can be segmented. For each position i, try all words in dictionary — if dp[i-len] is true and s[i-len..i-1] equals the word, set dp[i]=true. Store dict in a set for O(1) lookup. O(n²*m) time where m is max word length. dp[0]=true is the base case.",
    solution: `bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> ws(wordDict.begin(),wordDict.end());
    int n=s.size();
    vector<bool> dp(n+1,false); dp[0]=true;
    for(int i=1;i<=n;i++)
        for(auto& w:ws){
            int l=w.size();
            if(i>=l&&dp[i-l]&&s.substr(i-l,l)==w) dp[i]=true;
        }
    return dp[n];
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Combination Sum",
    description: "Given an array of distinct positive integers candidates and a target integer, return all unique combinations where the chosen numbers sum to target. Same number may be used unlimited times.",
    explanation: "Backtracking: try each candidate starting from index i (allowing reuse). Add to current combination, recurse with reduced target. If target reaches 0, add current combo to result. If target goes negative, backtrack. O(n^(T/M)) time where T is target and M is smallest candidate. Start index prevents duplicates.",
    solution: `vector<vector<int>> combinationSum(vector<int>& cands, int target) {
    vector<vector<int>> res; vector<int> cur;
    function<void(int,int)> bt=[&](int i,int rem){
        if(rem==0){res.push_back(cur);return;}
        for(int j=i;j<cands.size();j++){
            if(cands[j]>rem) continue;
            cur.push_back(cands[j]);
            bt(j,rem-cands[j]);
            cur.pop_back();
        }
    };
    bt(0,target);
    return res;
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
  {
    title: "Longest Increasing Subsequence",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    explanation: "DP: dp[i] = length of LIS ending at index i. For each i, check all j<i: if nums[j]<nums[i], dp[i]=max(dp[i],dp[j]+1). O(n²) time. Optimal O(n log n): maintain 'tails' array where tails[i] is smallest tail of LIS of length i+1. Binary search to place each number. The tails array length is the answer.",
    solution: `int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for(int n:nums){
        auto it=lower_bound(tails.begin(),tails.end(),n);
        if(it==tails.end()) tails.push_back(n);
        else *it=n;
    }
    return tails.size();
}`,
    category: "DSA", difficulty: "Medium", companies: []
  },
];
