import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Platform, Modal, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  const [selectedTab, setSelectedTab] = useState('预案');
  const [plan, setPlan] = useState({
    date: new Date().toISOString().split('T')[0],
    dimensions: {
      countryWill: '',
      news: '',
      capitalType: '',
      market: '',
      sector: ''
    },
    stock: '',
    buy: {
      method: '',
      conditions: '',
      position: ''
    },
    sell: {
      method: '',
      conditions: ''
    },
    notes: ''
  });
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(-1);
  const [transaction, setTransaction] = useState({
    buyPrice: '',
    sellPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
    sellDate: new Date().toISOString().split('T')[0],
    profit: 0
  });
  const [statistics, setStatistics] = useState({});
  const [backtest, setBacktest] = useState({
    planIndex: -1,
    startDate: '',
    endDate: '',
    result: null,
    isLoading: false
  });
  const [showBacktestModal, setShowBacktestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    deepseek: '',
    stockData: ''
  });

  // 维度选项
  const dimensionOptions = {
    countryWill: ['维护', '打压'],
    news: ['利好消息', '利空消息'],
    capitalType: ['量化（技术派）', '散户', '游资'],
    market: ['上升', '震荡', '下跌'],
    sector: ['上升', '震荡', '下跌']
  };

  // 买入方式选项
  const buyMethodOptions = ['分仓', '聚焦'];

  const handleSave = () => {
    if (isEditing) {
      const updatedPlans = [...plans];
      updatedPlans[editingIndex] = plan;
      setPlans(updatedPlans);
    } else {
      setPlans([...plans, plan]);
    }
    setPlan({
      date: new Date().toISOString().split('T')[0],
      dimensions: {
        countryWill: '',
        news: '',
        capitalType: '',
        market: '',
        sector: ''
      },
      stock: '',
      buy: {
        method: '',
        conditions: '',
        position: ''
      },
      sell: {
        method: '',
        conditions: ''
      },
      notes: ''
    });
    setIsEditing(false);
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    setPlan(plans[index]);
    setIsEditing(true);
    setEditingIndex(index);
    setSelectedTab('预案');
  };

  const handleDelete = (index) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
  };

  const handleDimensionChange = (dimension, value) => {
    setPlan({
      ...plan,
      dimensions: {
        ...plan.dimensions,
        [dimension]: value
      }
    });
  };

  const handleDimensionInput = (dimension, value) => {
    setPlan({
      ...plan,
      dimensions: {
        ...plan.dimensions,
        [dimension]: value
      }
    });
  };

  const handleBuyChange = (field, value) => {
    setPlan({
      ...plan,
      buy: {
        ...plan.buy,
        [field]: value
      }
    });
  };

  const handleBuyInput = (field, value) => {
    setPlan({
      ...plan,
      buy: {
        ...plan.buy,
        [field]: value
      }
    });
  };

  const handleSellChange = (field, value) => {
    setPlan({
      ...plan,
      sell: {
        ...plan.sell,
        [field]: value
      }
    });
  };

  const handleSellInput = (field, value) => {
    setPlan({
      ...plan,
      sell: {
        ...plan.sell,
        [field]: value
      }
    });
  };

  const generateDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setPlan({
      ...plan,
      date: formattedDate
    });
  };

  // 计算获利概率和统计数据
  const calculateStatistics = () => {
    const stats = {};
    
    // 按维度组合统计
    transactions.forEach(transaction => {
      const plan = plans[transaction.planIndex];
      if (!plan) return;
      
      const key = JSON.stringify({
        countryWill: plan.dimensions.countryWill,
        news: plan.dimensions.news,
        capitalType: plan.dimensions.capitalType,
        market: plan.dimensions.market,
        sector: plan.dimensions.sector
      });
      
      if (!stats[key]) {
        stats[key] = {
          total: 0,
          profitable: 0,
          dimension: plan.dimensions
        };
      }
      
      stats[key].total += 1;
      if (transaction.profit > 0) {
        stats[key].profitable += 1;
      }
    });
    
    // 计算每个维度组合的获利概率
    Object.keys(stats).forEach(key => {
      stats[key].profitProbability = (stats[key].profitable / stats[key].total) * 100;
    });
    
    setStatistics(stats);
  };

  // 当交易记录变化时重新计算统计数据
  useEffect(() => {
    calculateStatistics();
  }, [transactions, plans]);

  // 打开交易记录模态框
  const openTransactionModal = (index) => {
    setCurrentPlanIndex(index);
    setTransaction({
      buyPrice: '',
      sellPrice: '',
      buyDate: new Date().toISOString().split('T')[0],
      sellDate: new Date().toISOString().split('T')[0],
      profit: 0
    });
    setShowTransactionModal(true);
  };

  // 关闭交易记录模态框
  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setCurrentPlanIndex(-1);
  };

  // 计算交易利润
  const calculateProfit = () => {
    const buyPrice = parseFloat(transaction.buyPrice) || 0;
    const sellPrice = parseFloat(transaction.sellPrice) || 0;
    if (buyPrice > 0) {
      const profit = ((sellPrice - buyPrice) / buyPrice) * 100;
      setTransaction({
        ...transaction,
        profit: profit
      });
    }
  };

  // 保存交易记录
  const saveTransaction = () => {
    if (currentPlanIndex === -1) return;
    
    const newTransaction = {
      ...transaction,
      planIndex: currentPlanIndex
    };
    
    setTransactions([...transactions, newTransaction]);
    closeTransactionModal();
  };

  // 删除交易记录
  const deleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  // 打开回测模态框
  const openBacktestModal = (index) => {
    setBacktest({
      ...backtest,
      planIndex: index,
      startDate: '',
      endDate: '',
      result: null,
      isLoading: false
    });
    setShowBacktestModal(true);
  };

  // 关闭回测模态框
  const closeBacktestModal = () => {
    setShowBacktestModal(false);
    setBacktest({
      ...backtest,
      planIndex: -1,
      startDate: '',
      endDate: '',
      result: null,
      isLoading: false
    });
  };

  // 打开设置模态框
  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  // 关闭设置模态框
  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  // 保存API密钥
  const saveApiKeys = () => {
    // 这里可以添加保存API密钥到本地存储的逻辑
    closeSettingsModal();
  };

  // 执行策略回测
  const executeBacktest = async () => {
    if (backtest.planIndex === -1 || !backtest.startDate || !backtest.endDate) return;

    setBacktest({
      ...backtest,
      isLoading: true
    });

    try {
      // 检查API密钥是否设置
      if (!apiKeys.deepseek || !apiKeys.stockData) {
        alert('请先在设置中配置API密钥');
        setBacktest({
          ...backtest,
          isLoading: false
        });
        return;
      }

      const plan = plans[backtest.planIndex];
      
      // 1. 调用Deepseek API分析宏观维度和板块影响，获取推荐个股
      console.log('正在调用Deepseek API分析宏观维度...');
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.deepseek}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的A股市场分析师，擅长根据宏观维度和板块影响分析股票。请严格按照JSON格式输出结果，包含stockName(股票名称)、stockCode(股票代码)、reason(推荐理由)字段。'
            },
            {
              role: 'user',
              content: `根据以下维度分析，推荐在${backtest.startDate}到${backtest.endDate}期间可能表现较好的个股：\n国家意志: ${plan.dimensions.countryWill}\n消息面: ${plan.dimensions.news}\n资金类型: ${plan.dimensions.capitalType}\n大盘: ${plan.dimensions.market}\n板块: ${plan.dimensions.sector}\n请推荐3-5只核心领涨个股，并简要说明理由。请严格按照JSON格式输出结果。`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!deepseekResponse.ok) {
        throw new Error(`Deepseek API错误: ${deepseekResponse.status}`);
      }

      const deepseekData = await deepseekResponse.json();
      const recommendedStocks = JSON.parse(deepseekData.choices[0].message.content);
      console.log('Deepseek API返回推荐个股:', recommendedStocks);

      // 2. 调用A股数据API获取历史数据
      console.log('正在获取A股历史数据...');
      const stockCodes = recommendedStocks.map(stock => stock.stockCode);
      const stockDataPromises = stockCodes.map(async (code) => {
        // 这里使用聚宽API作为示例，实际项目中可以根据需要替换为其他API
        const stockDataResponse = await fetch(`https://dataapi.joinquant.com/apis?token=${apiKeys.stockData}&api=history&code=${code}&start_date=${backtest.startDate}&end_date=${backtest.endDate}&fields=open,close,high,low,volume`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!stockDataResponse.ok) {
          throw new Error(`股票数据API错误: ${stockDataResponse.status}`);
        }

        return await stockDataResponse.json();
      });

      const stockDataResults = await Promise.all(stockDataPromises);
      console.log('获取到股票历史数据:', stockDataResults);

      // 3. 执行回测逻辑
      console.log('正在执行回测逻辑...');
      const backtestResults = executeBacktestLogic(recommendedStocks, stockDataResults, plan);
      console.log('回测结果:', backtestResults);

      setBacktest({
        ...backtest,
        result: backtestResults,
        isLoading: false
      });
    } catch (error) {
      console.error('回测失败:', error);
      alert(`回测失败: ${error.message}`);
      setBacktest({
        ...backtest,
        isLoading: false
      });
    }
  };

  // 执行回测逻辑
  const executeBacktestLogic = (recommendedStocks, stockDataResults, plan) => {
    let totalTrades = 0;
    let profitableTrades = 0;
    let totalReturn = 0;
    let maxDrawdown = 0;
    const portfolioValues = [];
    const selectedStocks = [];

    // 初始化投资组合价值
    let portfolioValue = 10000;
    portfolioValues.push({ date: backtest.startDate, portfolioValue });

    // 对每只推荐的股票执行回测
    recommendedStocks.forEach((stock, index) => {
      const stockData = stockDataResults[index];
      if (!stockData || stockData.length === 0) return;

      // 模拟买入和卖出策略
      let buyPrice = stockData[0].open;
      let sellPrice = stockData[stockData.length - 1].close;
      let tradeReturn = ((sellPrice - buyPrice) / buyPrice) * 100;

      totalTrades++;
      if (tradeReturn > 0) {
        profitableTrades++;
      }

      // 计算总收益
      const weight = 1 / recommendedStocks.length; // 等权重分配
      totalReturn += tradeReturn * weight;

      // 更新投资组合价值
      portfolioValue *= (1 + tradeReturn / 100 * weight);
      portfolioValues.push({ date: stockData[stockData.length - 1].date, portfolioValue });

      // 记录选中的股票
      selectedStocks.push({
        name: stock.stockName,
        code: stock.stockCode,
        return: tradeReturn
      });
    });

    // 计算最大回撤
    let peak = portfolioValue;
    let drawdown = 0;
    portfolioValues.forEach(item => {
      if (item.portfolioValue > peak) {
        peak = item.portfolioValue;
      }
      const currentDrawdown = ((peak - item.portfolioValue) / peak) * 100;
      if (currentDrawdown > drawdown) {
        drawdown = currentDrawdown;
      }
    });
    maxDrawdown = drawdown;

    // 计算胜率
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

    return {
      totalTrades,
      profitableTrades,
      winRate,
      totalReturn,
      maxDrawdown,
      selectedStocks,
      performance: portfolioValues
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>A股交易预案</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={openSettingsModal}>
          <Text style={styles.settingsButtonText}>设置</Text>
        </TouchableOpacity>
      </View>

      {/* 标签切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '预案' && styles.activeTab]} 
          onPress={() => setSelectedTab('预案')}
        >
          <Text style={[styles.tabText, selectedTab === '预案' && styles.activeTabText]}>新建预案</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '历史' && styles.activeTab]} 
          onPress={() => setSelectedTab('历史')}
        >
          <Text style={[styles.tabText, selectedTab === '历史' && styles.activeTabText]}>历史预案</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '统计' && styles.activeTab]} 
          onPress={() => setSelectedTab('统计')}
        >
          <Text style={[styles.tabText, selectedTab === '统计' && styles.activeTabText]}>统计分析</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '回测' && styles.activeTab]} 
          onPress={() => setSelectedTab('回测')}
        >
          <Text style={[styles.tabText, selectedTab === '回测' && styles.activeTabText]}>策略回测</Text>
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.content}>
        {selectedTab === '预案' ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>交易预案</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>日期</Text>
              <View style={styles.dateContainer}>
                <TextInput 
                  style={[styles.input, styles.dateInput]} 
                  value={plan.date} 
                  onChangeText={(text) => setPlan({...plan, date: text})}
                />
                <TouchableOpacity style={styles.dateButton} onPress={generateDate}>
                  <Text style={styles.dateButtonText}>生成当日</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 维度选择 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>考虑维度</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>国家意志</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.countryWill.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.countryWill === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('countryWill', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.countryWill === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.countryWill} 
                  onChangeText={(text) => handleDimensionInput('countryWill', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>消息面</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.news.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.news === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('news', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.news === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.news} 
                  onChangeText={(text) => handleDimensionInput('news', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>资金类型（对手盘）</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.capitalType.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.capitalType === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('capitalType', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.capitalType === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.capitalType} 
                  onChangeText={(text) => handleDimensionInput('capitalType', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>大盘</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.market.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.market === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('market', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.market === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.market} 
                  onChangeText={(text) => handleDimensionInput('market', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>板块</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.sector.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.sector === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('sector', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.sector === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.sector} 
                  onChangeText={(text) => handleDimensionInput('sector', text)}
                  placeholder="或输入自定义值"
                />
              </View>
            </View>

            {/* 个股信息 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>个股</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>股票代码/名称</Text>
                <TextInput 
                  style={styles.input} 
                  value={plan.stock} 
                  onChangeText={(text) => setPlan({...plan, stock: text})}
                  placeholder="输入股票代码或名称"
                />
              </View>
            </View>

            {/* 买入策略 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>买入</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>买入方式</Text>
                <View style={styles.optionContainer}>
                  {buyMethodOptions.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.buy.method === option && styles.selectedOption
                      ]}
                      onPress={() => handleBuyChange('method', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.buy.method === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.buy.method} 
                  onChangeText={(text) => handleBuyInput('method', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>仓位</Text>
                <TextInput 
                  style={styles.input} 
                  value={plan.buy.position} 
                  onChangeText={(text) => handleBuyChange('position', text)}
                  placeholder="如：1/5 或 3/5"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>买入条件</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={plan.buy.conditions} 
                  onChangeText={(text) => handleBuyChange('conditions', text)}
                  placeholder="买入时机、价格区间、量能要求等"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* 卖出策略 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>卖出</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>卖出方式</Text>
                <TextInput 
                  style={styles.input} 
                  value={plan.sell.method} 
                  onChangeText={(text) => handleSellChange('method', text)}
                  placeholder="如：止盈、止损、分批卖出等"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>卖出条件</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={plan.sell.conditions} 
                  onChangeText={(text) => handleSellChange('conditions', text)}
                  placeholder="止盈点、止损点、形态变化等"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* 备注 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>备注</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={plan.notes} 
                onChangeText={(text) => setPlan({...plan, notes: text})}
                placeholder="其他需要记录的信息"
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{isEditing ? '更新预案' : '保存预案'}</Text>
            </TouchableOpacity>
          </View>
        ) : selectedTab === '历史' ? (
          <View style={styles.history}>
            <Text style={styles.historyTitle}>历史预案</Text>
            {plans.length === 0 ? (
              <Text style={styles.emptyText}>暂无历史预案</Text>
            ) : (
              plans.map((item, index) => (
                <View key={index} style={styles.planCard}>
                  <Text style={styles.planDate}>{item.date}</Text>
                  <Text style={styles.planStock}>{item.stock}</Text>
                  <Text style={styles.planSummary}>买入条件: {item.buy.conditions.substring(0, 50)}...</Text>
                  <View style={styles.planActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(index)}>
                      <Text style={styles.editButtonText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.transactionButton} onPress={() => openTransactionModal(index)}>
                      <Text style={styles.transactionButtonText}>记录交易</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backtestButton} onPress={() => openBacktestModal(index)}>
                      <Text style={styles.backtestButtonText}>策略回测</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(index)}>
                      <Text style={styles.deleteButtonText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : selectedTab === '统计' ? (
          <View style={styles.statistics}>
            <Text style={styles.statisticsTitle}>统计分析</Text>
            {Object.keys(statistics).length === 0 ? (
              <Text style={styles.emptyText}>暂无交易记录，无法生成统计数据</Text>
            ) : (
              Object.values(statistics).map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statDimensions}>
                    <Text style={styles.statDimensionItem}>国家意志: {stat.dimension.countryWill}</Text>
                    <Text style={styles.statDimensionItem}>消息面: {stat.dimension.news}</Text>
                    <Text style={styles.statDimensionItem}>资金类型: {stat.dimension.capitalType}</Text>
                    <Text style={styles.statDimensionItem}>大盘: {stat.dimension.market}</Text>
                    <Text style={styles.statDimensionItem}>板块: {stat.dimension.sector}</Text>
                  </View>
                  <View style={styles.statMetrics}>
                    <Text style={styles.statMetricItem}>总交易次数: {stat.total}</Text>
                    <Text style={styles.statMetricItem}>盈利次数: {stat.profitable}</Text>
                    <Text style={[styles.statMetricItem, stat.profitProbability > 50 ? styles.profitable : styles.unprofitable]}>
                      获利概率: {stat.profitProbability.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              ))
            )}
            
            <View style={styles.transactionsSection}>
              <Text style={styles.transactionsTitle}>交易记录</Text>
              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>暂无交易记录</Text>
              ) : (
                transactions.map((item, index) => {
                  const plan = plans[item.planIndex];
                  const stockName = plan ? plan.stock : '未知股票';
                  return (
                    <View key={index} style={styles.transactionCard}>
                      <Text style={styles.transactionsTitle}>交易记录 - {stockName}</Text>
                      <Text style={styles.transactionDate}>买入: {item.buyDate} | 卖出: {item.sellDate}</Text>
                      <Text style={styles.transactionPrice}>买入价: ¥{item.buyPrice} | 卖出价: ¥{item.sellPrice}</Text>
                      <Text style={[styles.transactionProfit, item.profit > 0 ? styles.profitable : styles.unprofitable]}>
                        盈亏: {item.profit.toFixed(2)}%
                      </Text>
                      <TouchableOpacity style={styles.deleteTransactionButton} onPress={() => deleteTransaction(index)}>
                        <Text style={styles.deleteTransactionButtonText}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        ) : (
          <View style={styles.backtest}>
            <Text style={styles.backtestTitle}>策略回测</Text>
            <Text style={styles.backtestDescription}>
              选择一个历史预案，设置回测时间范围，系统将使用大模型分析宏观维度和板块影响，
              识别核心领涨个股，并进行策略回测。
            </Text>
            
            {plans.length === 0 ? (
              <Text style={styles.emptyText}>暂无历史预案，无法进行回测</Text>
            ) : (
              <View style={styles.planList}>
                <Text style={styles.planListTitle}>选择预案进行回测</Text>
                {plans.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.planItem} 
                    onPress={() => openBacktestModal(index)}
                  >
                    <Text style={styles.planItemDate}>{item.date}</Text>
                    <Text style={styles.planItemStock}>{item.stock}</Text>
                    <Text style={styles.planItemSummary}>买入条件: {item.buy.conditions.substring(0, 30)}...</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 交易记录模态框 */}
      <Modal
        visible={showTransactionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeTransactionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>记录交易</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>买入价格</Text>
              <TextInput 
                style={styles.input} 
                value={transaction.buyPrice} 
                onChangeText={(text) => setTransaction({...transaction, buyPrice: text})}
                placeholder="输入买入价格"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>卖出价格</Text>
              <TextInput 
                style={styles.input} 
                value={transaction.sellPrice} 
                onChangeText={(text) => setTransaction({...transaction, sellPrice: text})}
                placeholder="输入卖出价格"
                keyboardType="decimal-pad"
                onBlur={calculateProfit}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>买入日期</Text>
              <TextInput 
                style={styles.input} 
                value={transaction.buyDate} 
                onChangeText={(text) => setTransaction({...transaction, buyDate: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>卖出日期</Text>
              <TextInput 
                style={styles.input} 
                value={transaction.sellDate} 
                onChangeText={(text) => setTransaction({...transaction, sellDate: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>盈亏</Text>
              <Text style={[styles.profitText, transaction.profit > 0 ? styles.profitable : styles.unprofitable]}>
                {transaction.profit.toFixed(2)}%
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeTransactionModal}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 回测模态框 */}
      <Modal
        visible={showBacktestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBacktestModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>策略回测</Text>
            
            {!backtest.result ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>开始日期</Text>
                  <TextInput 
                    style={styles.input} 
                    value={backtest.startDate} 
                    onChangeText={(text) => setBacktest({...backtest, startDate: text})}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>结束日期</Text>
                  <TextInput 
                    style={styles.input} 
                    value={backtest.endDate} 
                    onChangeText={(text) => setBacktest({...backtest, endDate: text})}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeBacktestModal}>
                    <Text style={styles.cancelButtonText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={executeBacktest}
                    disabled={backtest.isLoading}
                  >
                    <Text style={styles.saveButtonText}>
                      {backtest.isLoading ? '执行中...' : '执行回测'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.backtestResultTitle}>回测结果</Text>
                
                <View style={styles.backtestMetrics}>
                  <Text style={styles.backtestMetricItem}>总交易次数: {backtest.result.totalTrades}</Text>
                  <Text style={styles.backtestMetricItem}>盈利次数: {backtest.result.profitableTrades}</Text>
                  <Text style={[styles.backtestMetricItem, backtest.result.winRate > 50 ? styles.profitable : styles.unprofitable]}>
                    胜率: {backtest.result.winRate}%
                  </Text>
                  <Text style={[styles.backtestMetricItem, backtest.result.totalReturn > 0 ? styles.profitable : styles.unprofitable]}>
                    总收益: {backtest.result.totalReturn}%
                  </Text>
                  <Text style={styles.backtestMetricItem}>最大回撤: {backtest.result.maxDrawdown}%</Text>
                </View>
                
                <View style={styles.backtestStocks}>
                  <Text style={styles.backtestStocksTitle}>精选个股</Text>
                  {backtest.result.selectedStocks.map((stock, index) => (
                    <View key={index} style={styles.stockItem}>
                      <Text style={styles.stockName}>{stock.name} ({stock.code})</Text>
                      <Text style={[styles.stockReturn, stock.return > 0 ? styles.profitable : styles.unprofitable]}>
                        {stock.return}%
                      </Text>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.saveButton} onPress={closeBacktestModal}>
                  <Text style={styles.saveButtonText}>关闭</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 设置模态框 */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeSettingsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>API设置</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Deepseek API密钥</Text>
              <TextInput 
                style={styles.input} 
                value={apiKeys.deepseek} 
                onChangeText={(text) => setApiKeys({...apiKeys, deepseek: text})}
                placeholder="输入Deepseek API密钥"
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>A股数据API密钥</Text>
              <TextInput 
                style={styles.input} 
                value={apiKeys.stockData} 
                onChangeText={(text) => setApiKeys({...apiKeys, stockData: text})}
                placeholder="输入A股数据API密钥"
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={saveApiKeys}>
              <Text style={styles.saveButtonText}>保存设置</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1E90FF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginLeft: 10,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E90FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#1E90FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  history: {
    padding: 20,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 80,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planStock: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#1E90FF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  // 新增样式
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    marginRight: 10,
  },
  dateButton: {
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
    elevation: 3,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#1E90FF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  // 交易记录按钮
  transactionButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0fff0',
    borderRadius: 8,
  },
  transactionButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  // 统计分析页面
  statistics: {
    padding: 20,
  },
  statisticsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statDimensions: {
    marginBottom: 15,
  },
  statDimensionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statMetrics: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  statMetricItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  profitable: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  unprofitable: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  // 交易记录部分
  transactionsSection: {
    marginTop: 40,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionStock: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  transactionPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  transactionProfit: {
    fontSize: 16,
    marginBottom: 12,
  },
  deleteTransactionButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 6,
  },
  deleteTransactionButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  // 模态框
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  profitText: {
    fontSize: 18,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  // 回测按钮
  backtestButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f8f0ff',
    borderRadius: 8,
  },
  backtestButtonText: {
    color: '#9C27B0',
    fontSize: 14,
    fontWeight: '500',
  },
  // 回测标签页
  backtest: {
    padding: 20,
  },
  backtestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  backtestDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
    textAlign: 'center',
  },
  planList: {
    marginTop: 20,
  },
  planListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  planItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  planItemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planItemStock: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planItemSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // 回测结果
  backtestResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  backtestMetrics: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  backtestMetricItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  backtestStocks: {
    marginBottom: 25,
  },
  backtestStocksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  stockName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  stockReturn: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;