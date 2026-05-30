export const dsaHard = [
  {
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    explanation: "Two pointer approach: maintain left and right pointers and track leftMax and rightMax. Water at a position is min(leftMax,rightMax)-height[i]. Move the pointer with smaller max value inward since that side determines water level. O(n) time, O(1) space vs O(n) for prefix max arrays approach.",
    solution: `int trap(vector<int>& height) {
    int l=0,r=height.size()-1,lMax=0,rMax=0,res=0;
    while(l<r){
        if(height[l]<height[r]){
            if(height[l]>=lMax) lMax=height[l];
            else res+=lMax-height[l];
            l++;
        } else {
            if(height[r]>=rMax) rMax=height[r];
            else res+=rMax-height[r];
            r--;
        }
    }
    return res;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Merge K Sorted Lists",
    description: "You are given an array of k linked-lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    explanation: "Use a min-heap (priority queue) storing (value, list index, node pointer). Initially push heads of all lists. Pop minimum, add to result, push the next node from that list. O(N log k) time where N is total nodes. Alternative: divide and conquer merging pairs, also O(N log k). Heap approach is more intuitive.",
    solution: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp=[](ListNode* a,ListNode* b){return a->val>b->val;};
    priority_queue<ListNode*,vector<ListNode*>,decltype(cmp)> pq(cmp);
    for(auto l:lists) if(l) pq.push(l);
    ListNode dummy(0); ListNode* cur=&dummy;
    while(!pq.empty()){
        cur->next=pq.top();pq.pop();cur=cur->next;
        if(cur->next) pq.push(cur->next);
    }
    return dummy.next;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Largest Rectangle in Histogram",
    description: "Given an array of integers heights representing the histogram's bar heights, return the area of the largest rectangle in the histogram.",
    explanation: "Monotonic stack: maintain a stack of bars in increasing height order. When we find a shorter bar, pop taller bars and calculate area using popped height and current width (current index - stack top - 1). Append a 0 at the end to flush all remaining bars. O(n) time, O(n) space. Each bar is pushed and popped once.",
    solution: `int largestRectangleArea(vector<int>& heights) {
    heights.push_back(0);
    stack<int> st; int res=0;
    for(int i=0;i<heights.size();i++){
        while(!st.empty()&&heights[st.top()]>heights[i]){
            int h=heights[st.top()]; st.pop();
            int w=st.empty()?i:i-st.top()-1;
            res=max(res,h*w);
        }
        st.push(i);
    }
    return res;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Sliding Window Maximum",
    description: "Given an integer array nums and a sliding window of size k, return the maximum value in each window position as it moves left to right.",
    explanation: "Use a monotone decreasing deque storing indices. For each new element, remove from back all elements smaller than it (they can never be maximum). Remove from front if the index is outside current window. Front of deque is always the current window maximum. O(n) time — each element added/removed from deque at most once.",
    solution: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq; vector<int> res;
    for(int i=0;i<nums.size();i++){
        while(!dq.empty()&&dq.front()<i-k+1) dq.pop_front();
        while(!dq.empty()&&nums[dq.back()]<nums[i]) dq.pop_back();
        dq.push_back(i);
        if(i>=k-1) res.push_back(nums[dq.front()]);
    }
    return res;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Minimum Window Substring",
    description: "Given strings s and t, return the minimum window substring of s that contains all characters of t. If no such window exists, return empty string.",
    explanation: "Sliding window with two frequency maps. Expand right to include needed characters; when all chars of t are covered, shrink left to minimize window. Track 'formed' count to know when window is valid. O(|s|+|t|) time. Use 'have' and 'need' counters to efficiently check window validity without iterating the map.",
    solution: `string minWindow(string s, string t) {
    unordered_map<char,int> need,have_map;
    for(char c:t) need[c]++;
    int have=0,need_cnt=need.size(),l=0,res_len=INT_MAX,res_l=0;
    for(int r=0;r<s.size();r++){
        char c=s[r]; have_map[c]++;
        if(need.count(c)&&have_map[c]==need[c]) have++;
        while(have==need_cnt){
            if(r-l+1<res_len){res_len=r-l+1;res_l=l;}
            have_map[s[l]]--;
            if(need.count(s[l])&&have_map[s[l]]<need[s[l]]) have--;
            l++;
        }
    }
    return res_len==INT_MAX?"":s.substr(res_l,res_len);
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Edit Distance",
    description: "Given two strings word1 and word2, return the minimum number of operations (insert, delete, replace) required to convert word1 to word2.",
    explanation: "DP table where dp[i][j] = min operations to convert word1[0..i-1] to word2[0..j-1]. If chars match: dp[i][j]=dp[i-1][j-1]. If not: dp[i][j]=1+min(dp[i-1][j] delete, dp[i][j-1] insert, dp[i-1][j-1] replace). Base cases: dp[i][0]=i, dp[0][j]=j. O(m*n) time and space. Space optimizable to O(n).",
    solution: `int minDistance(string w1, string w2) {
    int m=w1.size(),n=w2.size();
    vector<vector<int>> dp(m+1,vector<int>(n+1,0));
    for(int i=0;i<=m;i++) dp[i][0]=i;
    for(int j=0;j<=n;j++) dp[0][j]=j;
    for(int i=1;i<=m;i++)
        for(int j=1;j<=n;j++){
            if(w1[i-1]==w2[j-1]) dp[i][j]=dp[i-1][j-1];
            else dp[i][j]=1+min({dp[i-1][j],dp[i][j-1],dp[i-1][j-1]});
        }
    return dp[m][n];
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Word Ladder",
    description: "Given beginWord, endWord, and a wordList, find the length of the shortest transformation sequence from beginWord to endWord, changing one letter at a time, using only words from wordList.",
    explanation: "BFS from beginWord. At each step, try changing each character to a-z and check if the resulting word is in wordList. If it is, add to queue and remove from set (to prevent revisiting). Return level+1 when endWord is found. O(M²*N) time where M is word length and N is wordList size. BFS guarantees shortest path.",
    solution: `int ladderLength(string begin, string end, vector<string>& wl) {
    unordered_set<string> ws(wl.begin(),wl.end());
    if(!ws.count(end)) return 0;
    queue<string> q; q.push(begin);
    int steps=1;
    while(!q.empty()){
        int sz=q.size();
        while(sz--){
            string w=q.front();q.pop();
            if(w==end) return steps;
            for(int i=0;i<w.size();i++){
                char orig=w[i];
                for(char c='a';c<='z';c++){
                    w[i]=c;
                    if(ws.count(w)){q.push(w);ws.erase(w);}
                }
                w[i]=orig;
            }
        }
        steps++;
    }
    return 0;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "N-Queens",
    description: "Place n queens on an n×n chessboard so that no two queens attack each other. Return all distinct solutions where each is a board configuration.",
    explanation: "Backtracking: place queens row by row. Track which columns, diagonals (row-col), and anti-diagonals (row+col) are occupied using sets. At each row, try each column; if safe, place and recurse. Backtrack when done. The diagonal trick (r-c and r+c) uniquely identifies each diagonal. O(n!) time.",
    solution: `vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> res;
    vector<string> board(n,string(n,'.'));
    set<int> cols,diag,adiag;
    function<void(int)> bt=[&](int r){
        if(r==n){res.push_back(board);return;}
        for(int c=0;c<n;c++){
            if(cols.count(c)||diag.count(r-c)||adiag.count(r+c)) continue;
            board[r][c]='Q';cols.insert(c);diag.insert(r-c);adiag.insert(r+c);
            bt(r+1);
            board[r][c]='.';cols.erase(c);diag.erase(r-c);adiag.erase(r+c);
        }
    };
    bt(0); return res;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
    explanation: "Binary search on the smaller array. Partition both arrays so that left halves combined have (m+n+1)/2 elements. Check if partition is valid: maxLeft1<=minRight2 and maxLeft2<=minRight1. Adjust binary search based on comparison. O(log(min(m,n))) time. This is a classic hard binary search problem — the key insight is finding the correct partition.",
    solution: `double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
    if(a.size()>b.size()) swap(a,b);
    int m=a.size(),n=b.size(),l=0,r=m;
    while(l<=r){
        int pa=l+(r-l)/2,pb=(m+n+1)/2-pa;
        int aL=pa?a[pa-1]:INT_MIN,aR=pa<m?a[pa]:INT_MAX;
        int bL=pb?b[pb-1]:INT_MIN,bR=pb<n?b[pb]:INT_MAX;
        if(aL<=bR&&bL<=aR){
            if((m+n)%2) return max(aL,bL);
            return (max(aL,bL)+min(aR,bR))/2.0;
        } else if(aL>bR) r=pa-1;
        else l=pa+1;
    }
    return 0;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    description: "Design an algorithm to serialize a binary tree to a string and deserialize that string back to the original tree structure.",
    explanation: "BFS serialization: level-order traversal, null nodes represented as '#'. Deserialization: split by delimiter, use a queue to reconstruct level by level. Each node's left and right children are the next two values. O(n) time and space for both operations. Pre-order DFS also works and is simpler to implement recursively.",
    solution: `string serialize(TreeNode* root) {
    if(!root) return "";
    queue<TreeNode*> q; q.push(root);
    string res="";
    while(!q.empty()){
        auto n=q.front();q.pop();
        if(n){res+=to_string(n->val)+",";q.push(n->left);q.push(n->right);}
        else res+="#,";
    }
    return res;
}
TreeNode* deserialize(string data) {
    if(data.empty()) return nullptr;
    stringstream ss(data); string val;
    getline(ss,val,',');
    TreeNode* root=new TreeNode(stoi(val));
    queue<TreeNode*> q; q.push(root);
    while(!q.empty()){
        auto n=q.front();q.pop();
        if(getline(ss,val,',')&&val!="#"){n->left=new TreeNode(stoi(val));q.push(n->left);}
        if(getline(ss,val,',')&&val!="#"){n->right=new TreeNode(stoi(val));q.push(n->right);}
    }
    return root;
}`,
    category: "DSA", difficulty: "Hard", companies: []
  },
];
