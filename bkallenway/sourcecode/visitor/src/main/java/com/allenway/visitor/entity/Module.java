package com.allenway.visitor.entity;

import com.allenway.commons.entity.BaseEntity;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * Created by wuhuachuan on 16/5/30.
 */
@ToString(callSuper = true)
@Data
@Entity
@Table(name = "tb_module")
@NoArgsConstructor
public class Module extends BaseEntity{

    private String name;
    private String link;
    private int weight; //权重,用于控制 module 在用户界面的显示位置
}