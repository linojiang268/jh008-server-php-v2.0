<?php

/**
 * This is the model class for table "act_notice".
 *
 * The followings are the available columns in table 'act_notice':
 * @property string $id
 * @property string $act_id
 * @property string $subject
 * @property string $descri
 * @property integer $status
 * @property string $create_time
 * @property string $modify_time
 *
 * The followings are the available model relations:
 * @property ActInfo $act
 */
class ActNotice extends ActModel
{
	/**
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return 'act_notice';
	}

	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			array('act_id, descri, create_time, modify_time', 'required'),
			array('status', 'numerical', 'integerOnly'=>true),
			array('act_id', 'length', 'max'=>10),
			array('subject', 'length', 'max'=>64),
			array('descri', 'length', 'max'=>1024),
			// The following rule is used by search().
			// @todo Please remove those attributes that should not be searched.
			array('id, act_id, subject, descri, status, create_time, modify_time', 'safe', 'on'=>'search'),
		);
	}

	/**
	 * @return array relational rules.
	 */
	public function relations()
	{
		// NOTE: you may need to adjust the relation name and the related
		// class name for the relations automatically generated below.
		return array(
			//'act' => array(self::BELONGS_TO, 'ActInfo', 'act_id'),
		);
	}

	/**
	 * @return array customized attribute labels (name=>label)
	 */
	public function attributeLabels()
	{
		return array(
			'id' => '活动通知id',
			'act_id' => '活动id',
			'subject' => '标题',
			'descri' => '内容描述',
			'status' => '状态',
			'create_time' => '创建时间',
			'modify_time' => '修改时间',
		);
	}

	/**
	 * Retrieves a list of models based on the current search/filter conditions.
	 *
	 * Typical usecase:
	 * - Initialize the model fields with values from filter form.
	 * - Execute this method to get CActiveDataProvider instance which will filter
	 * models according to data in model fields.
	 * - Pass data provider to CGridView, CListView or any similar widget.
	 *
	 * @return CActiveDataProvider the data provider that can return the models
	 * based on the search/filter conditions.
	 */
	public function search()
	{
		// @todo Please modify the following code to remove attributes that should not be searched.

		$criteria=new CDbCriteria;

		$criteria->compare('id',$this->id,true);
		$criteria->compare('act_id',$this->act_id,true);
		$criteria->compare('subject',$this->subject,true);
		$criteria->compare('descri',$this->descri,true);
		$criteria->compare('status',$this->status);
		$criteria->compare('create_time',$this->create_time,true);
		$criteria->compare('modify_time',$this->modify_time,true);

		return new CActiveDataProvider($this, array(
			'criteria'=>$criteria,
		));
	}

	/**
	 * Returns the static model of the specified AR class.
	 * Please note that you should have this exact method in all your CActiveRecord descendants!
	 * @param string $className active record class name.
	 * @return ActNotice the static model class
	 */
	public static function model($className=__CLASS__)
	{
		return parent::model($className);
	}
    
    
    /**
     * 活动最新通知
     * 
     * @param type $actId 活动id
     * @param type $page 页数
     * @param type $size 每页记录数
     */
    public function notices($actId, $page, $size)
    {
        $cr = new CDbCriteria();
        $cr->compare('t.act_id', $actId);
        $cr->compare('t.status', '<>' . ConstStatus::DELETE);
        $count = $this->count($cr);
        $cr->order = 't.id desc';
        $cr->offset = ($page - 1) * $size;
        $cr->limit = $size;
        $rst = $this->findAll($cr);
        
        $notices = array();
        foreach ($rst as $v) {
            $model = array();
            $model['id'] = $v->id;
            $model['subject'] = $v->subject;
            $model['descri'] = $v->descri;
            $model['create_time'] = $v->create_time;
            array_push($notices, $model);
        }
        
        return array(
            'total_num' => $count,
            'act_notices' => $notices,
        );
    }
    
}
